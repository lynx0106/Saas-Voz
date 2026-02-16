/**
 * API de Text-to-Speech (TTS)
 * 
 * @description Genera audio a partir de texto usando OpenAI TTS
 * @version 2.0.0
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { logApi } from '@/lib/api-utils';

// ============================================================
// TIPOS
// ============================================================

interface TTSRequest {
  text: string;
  agentId?: string;
}

interface VoiceSettings {
  provider: string;
  voiceId: string;
  speed?: number;
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

const DEFAULT_VOICE = 'alloy';
const DEFAULT_MODEL = 'tts-1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================================
// CLIENTES
// ============================================================

/**
 * Obtiene el cliente de Supabase Admin
 */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
}

/**
 * Obtiene el cliente de OpenAI
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  return new OpenAI({ apiKey });
}

// ============================================================
// FUNCIONES
// ============================================================

/**
 * Obtiene la configuración de voz de un agente
 */
async function getAgentVoiceSettings(
  agentId: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<VoiceSettings | null> {
  if (!supabase) return null;
  
  try {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('voice_settings')
      .eq('id', agentId)
      .single();
    
    if (error || !agent?.voice_settings) {
      return null;
    }
    
    return agent.voice_settings as VoiceSettings;
  } catch (error) {
    console.error('[TTS] Error fetching voice settings:', error);
    return null;
  }
}

/**
 * Mapea el voiceId a una voz válida de OpenAI
 */
function mapToOpenAIVoice(voiceId: string): string {
  const openAIVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  
  // Si ya es una voz válida de OpenAI, usarla
  if (openAIVoices.includes(voiceId)) {
    return voiceId;
  }
  
  // Mapeo básico para otros proveedores
  const voiceMap: Record<string, string> = {
    'rachel': 'alloy',
    'domi': 'nova',
    'bella': 'shimmer',
    'antoni': 'echo',
    'default': 'alloy',
  };
  
  return voiceMap[voiceId.toLowerCase()] || DEFAULT_VOICE;
}

// ============================================================
// ENDPOINTS
// ============================================================

/**
 * OPTIONS /api/tts
 * Maneja preflight CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

/**
 * POST /api/tts
 * Genera audio a partir de texto
 */
export async function POST(req: Request): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parsear body
    const body: TTSRequest = await req.json();
    const { text, agentId } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Se requiere texto para convertir' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verificar OpenAI
    const openai = getOpenAIClient();
    
    if (!openai) {
      // En modo demo, indicar al cliente que use TTS del navegador
      logApi('/api/tts', 'POST', 'success', {
        mode: 'browser-fallback',
        reason: 'No OpenAI API key',
      });
      
      return NextResponse.json(
        { use_browser_tts: true },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Obtener configuración de voz del agente si existe
    let voiceSettings: VoiceSettings | null = null;
    
    if (agentId) {
      const supabase = getSupabaseAdmin();
      voiceSettings = await getAgentVoiceSettings(agentId, supabase);
    }

    // Determinar voz a usar
    const voice = voiceSettings?.voiceId 
      ? mapToOpenAIVoice(voiceSettings.voiceId)
      : DEFAULT_VOICE;

    // Generar audio
    const mp3 = await openai.audio.speech.create({
      model: DEFAULT_MODEL,
      voice: voice as OpenAI.Audio.Speech.SpeechCreateParams['voice'],
      input: text,
      speed: voiceSettings?.speed || 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const duration = Date.now() - startTime;

    logApi('/api/tts', 'POST', 'success', {
      textLength: text.length,
      voice,
      audioSize: buffer.length,
      duration: `${duration}ms`,
    });

    return new NextResponse(buffer, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApi('/api/tts', 'POST', 'error', {
      error: String(error),
      duration: `${duration}ms`,
    });
    
    return NextResponse.json(
      { error: 'Error al generar audio' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
