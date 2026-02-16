/**
 * Rutas WebSocket para Voice AI Server
 * 
 * @description Maneja conexiones WebSocket para streaming de audio bidireccional
 * @version 2.0.0
 * @lastUpdated 2026-02-16
 */

import { FastifyInstance } from 'fastify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ============================================================
// TIPOS LOCALES
// ============================================================

/** Mensajes del cliente al servidor */
export type ClientMessage =
  | { type: 'setup'; agentId: string }
  | { type: 'conversation_input'; text: string }
  | { type: 'audio_input'; audio: string }
  | { type: 'ping' };

/** Mensajes del servidor al cliente */
export type ServerMessage =
  | { type: 'ready' }
  | { type: 'audio_delta'; text: string }
  | { type: 'audio_output'; audio: string }
  | { type: 'end_of_turn' }
  | { type: 'error'; message: string }
  | { type: 'pong' };

// ============================================================
// CONFIGURACIÓN Y CLIENTES
// ============================================================

interface VoiceServerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
  defaultModel: string;
  defaultSystemPrompt: string;
}

/**
 * Obtiene la configuración del servidor desde variables de entorno
 */
function getConfig(): VoiceServerConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[CONFIG] Missing Supabase credentials');
  }

  if (!openaiApiKey) {
    console.error('[CONFIG] Missing OpenAI API key');
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabaseKey: supabaseKey || '',
    openaiApiKey: openaiApiKey || 'dummy-key',
    defaultModel: 'gpt-3.5-turbo',
    defaultSystemPrompt: 'Eres un asistente de voz amigable y profesional.',
  };
}

// ============================================================
// GESTIÓN DE CLIENTES (Singleton pattern)
// ============================================================

let supabaseClient: SupabaseClient | null = null;
let openaiClient: OpenAI | null = null;

/**
 * Obtiene o crea el cliente de Supabase
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const config = getConfig();
    if (!config.supabaseUrl) {
      throw new Error('SUPABASE_URL is not configured');
    }
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return supabaseClient;
}

/**
 * Obtiene o crea el cliente de OpenAI
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const config = getConfig();
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
}

// ============================================================
// ESTADO DE LA LLAMADA
// ============================================================

interface CallState {
  agentId: string | null;
  systemPrompt: string;
  conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  startTime: number;
}

/**
 * Crea un estado inicial para una nueva llamada
 */
function createCallState(): CallState {
  return {
    agentId: null,
    systemPrompt: getConfig().defaultSystemPrompt,
    conversationHistory: [],
    startTime: Date.now(),
  };
}

// ============================================================
// HANDLERS DE MENSAJES
// ============================================================

/**
 * Maneja el mensaje de setup para inicializar la llamada
 */
async function handleSetup(
  state: CallState,
  message: Extract<ClientMessage, { type: 'setup' }>,
  supabase: SupabaseClient
): Promise<void> {
  state.agentId = message.agentId;
  console.log(`[SETUP] Agent ID: ${state.agentId}`);

  if (state.agentId) {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('system_prompt')
      .eq('id', state.agentId)
      .single();

    if (error) {
      console.error('[SETUP] Error fetching agent:', error.message);
      return;
    }

    if (agent?.system_prompt) {
      state.systemPrompt = agent.system_prompt;
      console.log('[SETUP] System prompt loaded');
    }
  }
}

/**
 * Busca contexto relevante en la base de conocimiento usando RAG
 */
async function searchKnowledgeBase(
  query: string,
  agentId: string,
  supabase: SupabaseClient,
  openai: OpenAI
): Promise<string> {
  try {
    // Generar embedding de la consulta
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Buscar documentos similares
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 2,
      filter_agent_id: agentId,
    });

    if (error) {
      console.error('[RAG] Error searching knowledge base:', error.message);
      return '';
    }

    if (!documents || (documents as any[]).length === 0) {
      return '';
    }

    return (documents as any[]).map((doc: any) => doc.content_text).join('\n---\n');
  } catch (error) {
    console.error('[RAG] Error in knowledge base search:', error);
    return '';
  }
}

/**
 * Maneja la entrada de conversación y genera respuesta
 */
async function handleConversationInput(
  state: CallState,
  message: Extract<ClientMessage, { type: 'conversation_input' }>,
  socket: WebSocket,
  supabase: SupabaseClient,
  openai: OpenAI
): Promise<void> {
  const userText = message.text;
  console.log(`[CONVERSATION] User: ${userText.substring(0, 50)}...`);

  // Buscar contexto relevante si hay agente
  let contextText = '';
  if (state.agentId) {
    contextText = await searchKnowledgeBase(userText, state.agentId, supabase, openai);
  }

  // Construir prompt con contexto
  const systemPrompt = contextText
    ? `${state.systemPrompt}\n\nCONTEXTO RELEVANTE:\n${contextText}`
    : state.systemPrompt;

  // Construir historial de mensajes
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...state.conversationHistory,
    { role: 'user', content: userText },
  ];

  // Llamar al LLM con streaming
  const stream = await openai.chat.completions.create({
    model: getConfig().defaultModel,
    messages,
    stream: true,
  });

  // Enviar chunks de texto al cliente
  let fullResponse = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullResponse += content;
      const serverMessage: ServerMessage = { type: 'audio_delta', text: content };
      socket.send(JSON.stringify(serverMessage));
    }
  }

  // Actualizar historial
  state.conversationHistory.push(
    { role: 'user', content: userText },
    { role: 'assistant', content: fullResponse }
  );

  // Limitar historial para evitar tokens excesivos
  if (state.conversationHistory.length > 20) {
    state.conversationHistory = state.conversationHistory.slice(-20);
  }

  // Señalizar fin del turno
  const endMessage: ServerMessage = { type: 'end_of_turn' };
  socket.send(JSON.stringify(endMessage));
}

// ============================================================
// RUTAS WEBSOCKET
// ============================================================

/**
 * Registra las rutas WebSocket en el servidor Fastify
 */
export async function websocketRoutes(fastify: FastifyInstance): Promise<void> {
  const supabase = getSupabaseClient();
  const openai = getOpenAIClient();

  // Ruta principal de WebSocket para llamadas
  fastify.get('/connection', { websocket: true }, (connection, req) => {
    console.log('[WS] Client connected');

    // En @fastify/websocket v11+, connection puede ser el socket directamente
    const socket = (connection as any).socket || connection;
    const state = createCallState();

    // Handler de mensajes
    socket.on('message', async (rawMessage: Buffer) => {
      try {
        const message: ClientMessage = JSON.parse(rawMessage.toString());
        console.log(`[WS] Received: ${message.type}`);

        switch (message.type) {
          case 'setup':
            await handleSetup(state, message, supabase);
            const readyMessage: ServerMessage = { type: 'ready' };
            socket.send(JSON.stringify(readyMessage));
            break;

          case 'conversation_input':
            await handleConversationInput(state, message, socket, supabase, openai);
            break;

          case 'ping':
            const pongMessage: ServerMessage = { type: 'pong' };
            socket.send(JSON.stringify(pongMessage));
            break;

          default:
            console.warn('[WS] Unknown message type:', (message as any).type);
        }
      } catch (error) {
        console.error('[WS] Error processing message:', error);
        const errorMessage: ServerMessage = {
          type: 'error',
          message: 'Error interno del servidor',
        };
        socket.send(JSON.stringify(errorMessage));
      }
    });

    // Handler de cierre
    socket.on('close', () => {
      const duration = Date.now() - state.startTime;
      console.log(`[WS] Client disconnected. Duration: ${duration}ms`);
    });

    // Handler de errores
    socket.on('error', (error: Error) => {
      console.error('[WS] Socket error:', error);
    });
  });

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'voice-server',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  }));

  // Status endpoint con información más detallada
  fastify.get('/status', async () => ({
    status: 'ok',
    service: 'voice-server',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  }));
}
