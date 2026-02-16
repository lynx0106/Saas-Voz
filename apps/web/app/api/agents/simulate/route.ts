/**
 * API de Simulación de Agente
 * 
 * @description Simula conversaciones con un agente para pruebas
 * @version 2.0.0
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseBody,
  logApi,
} from '@/lib/api-utils';

// ============================================================
// TIPOS
// ============================================================

interface SimulateMessage {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

interface SimulateRequest {
  messages: SimulateMessage[];
  systemPrompt: string;
  agentId?: string;
}

interface RAGDocument {
  id: string;
  content_text: string;
  similarity: number;
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHAT_MODEL = 'gpt-3.5-turbo';
const RAG_THRESHOLD = 0.5;
const RAG_MAX_DOCUMENTS = 3;

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

/**
 * Obtiene el cliente de OpenAI configurado
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('[SIMULATE] Missing OPENAI_API_KEY');
    return null;
  }
  
  return new OpenAI({ apiKey });
}

/**
 * Busca contexto relevante en la base de conocimiento
 */
async function searchKnowledgeBase(
  query: string,
  agentId: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  try {
    // Generar embedding
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
      encoding_format: 'float',
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Buscar documentos similares
    const { data: documents, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: RAG_THRESHOLD,
      match_count: RAG_MAX_DOCUMENTS,
      filter_agent_id: agentId,
    });

    if (searchError) {
      console.error('[SIMULATE] RAG search error:', searchError.message);
      return '';
    }

    if (!documents || documents.length === 0) {
      return '';
    }

    // Formatear contexto
    return (documents as RAGDocument[])
      .map(doc => doc.content_text)
      .join('\n---\n');
  } catch (error) {
    console.error('[SIMULATE] RAG error:', error);
    return '';
  }
}

/**
 * Construye el prompt del sistema con contexto RAG
 */
function buildSystemPrompt(basePrompt: string, context: string): string {
  if (!context) {
    return basePrompt;
  }

  return `${basePrompt}

CONTEXTO RELEVANTE (Base de Conocimiento):
${context}`;
}

// ============================================================
// ENDPOINT
// ============================================================

/**
 * POST /api/agents/simulate
 * Simula una conversación con un agente
 */
export async function POST(req: Request): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse();
    }

    // Verificar API key de OpenAI
    const openai = getOpenAIClient();
    if (!openai) {
      return errorResponse('Configuración de servidor incompleta: Falta OPENAI_API_KEY', 500);
    }

    // Parsear body
    const body = await parseBody<SimulateRequest>(req);
    
    if (body instanceof NextResponse) {
      return body; // Error response
    }

    // Validar campos requeridos
    if (!body.messages || !Array.isArray(body.messages)) {
      return errorResponse('Se requiere un array de mensajes', 400);
    }

    if (!body.systemPrompt) {
      return errorResponse('Se requiere systemPrompt', 400);
    }

    const { messages, systemPrompt, agentId } = body;
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content || '';

    // Buscar contexto RAG si hay agente
    let contextText = '';
    if (agentId && userQuery) {
      contextText = await searchKnowledgeBase(userQuery, agentId, openai, supabase);
    }

    // Construir prompt final
    const finalSystemPrompt = buildSystemPrompt(systemPrompt, contextText);

    // Llamar al LLM
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message;

    const duration = Date.now() - startTime;
    logApi('/api/agents/simulate', 'POST', 'success', {
      agentId,
      messageCount: messages.length,
      hadRAGContext: !!contextText,
      duration: `${duration}ms`,
    });

    return successResponse(reply);
  } catch (error) {
    const duration = Date.now() - startTime;
    logApi('/api/agents/simulate', 'POST', 'error', {
      error: String(error),
      duration: `${duration}ms`,
    });
    return errorResponse('Error interno del servidor', 500);
  }
}
