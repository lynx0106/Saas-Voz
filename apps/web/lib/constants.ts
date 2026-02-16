/**
 * Constantes compartidas para Voice AI SaaS
 * 
 * @description Valores constantes usados en toda la aplicación
 * @version 1.0.0
 */

// ============================================================
// MODELOS DE IA
// ============================================================

/** Modelos de OpenAI disponibles */
export const OPENAI_MODELS = {
  /** Modelo de chat principal */
  CHAT: 'gpt-3.5-turbo',
  /** Modelo de chat avanzado */
  CHAT_ADVANCED: 'gpt-4o',
  /** Modelo de embeddings */
  EMBEDDING: 'text-embedding-3-small',
  /** Modelo de TTS */
  TTS: 'tts-1',
  /** Modelo de TTS HD */
  TTS_HD: 'tts-1-hd',
} as const;

/** Voces disponibles en OpenAI TTS */
export const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;

/** Modelos de Groq disponibles */
export const GROQ_MODELS = {
  /** Llama 3.1 70B - Rápido y potente */
  LLAMA_70B: 'llama-3.1-70b-versatile',
  /** Llama 3.1 8B - Ultra rápido */
  LLAMA_8B: 'llama-3.1-8b-instant',
  /** Mixtral 8x7B */
  MIXTRAL: 'mixtral-8x7b-32768',
} as const;

// ============================================================
// CONFIGURACIÓN DE RAG
// ============================================================

/** Configuración de embeddings y búsqueda */
export const RAG_CONFIG = {
  /** Tamaño de chunk en caracteres (~250 tokens) */
  CHUNK_SIZE: 1000,
  /** Overlap entre chunks */
  CHUNK_OVERLAP: 200,
  /** Umbral de similitud para búsqueda */
  MATCH_THRESHOLD: 0.5,
  /** Máximo de documentos a retornar */
  MAX_DOCUMENTS: 3,
} as const;

// ============================================================
// CONFIGURACIÓN DE VOZ
// ============================================================

/** Configuración de latencia objetivo */
export const VOICE_CONFIG = {
  /** Latencia objetivo voice-to-voice en ms */
  TARGET_LATENCY_MS: 800,
  /** Tamaño máximo de mensaje de audio */
  MAX_AUDIO_PAYLOAD: 1048576, // 1MB
  /** Sample rate de audio */
  SAMPLE_RATE: 16000,
} as const;

// ============================================================
// LÍMITES
// ============================================================

/** Límites de la aplicación */
export const LIMITS = {
  /** Tamaño máximo de archivo para knowledge base (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Máximo de agentes por organización (plan free) */
  MAX_AGENTS_FREE: 1,
  /** Máximo de agentes por organización (plan pro) */
  MAX_AGENTS_PRO: 10,
  /** Máximo de agentes por organización (plan enterprise) */
  MAX_AGENTS_ENTERPRISE: 100,
  /** Máximo de contactos por organización */
  MAX_CONTACTS: 10000,
  /** Historial máximo de mensajes en conversación */
  MAX_CONVERSATION_HISTORY: 20,
} as const;

// ============================================================
// PLANES Y PRECIOS
// ============================================================

/** Configuración de planes */
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxAgents: LIMITS.MAX_AGENTS_FREE,
    features: ['1 agente', '100 minutos/mes', 'Soporte por email'],
  },
  pro: {
    name: 'Pro',
    price: 49,
    maxAgents: LIMITS.MAX_AGENTS_PRO,
    features: ['10 agentes', 'Minutos ilimitados', 'Soporte prioritario', 'Analytics'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    maxAgents: LIMITS.MAX_AGENTS_ENTERPRISE,
    features: ['Agentes ilimitados', 'Minutos ilimitados', 'Soporte 24/7', 'API access', 'SLA'],
  },
} as const;

// ============================================================
// MENSAJES
// ============================================================

/** Mensajes predeterminados */
export const MESSAGES = {
  /** Mensaje de bienvenida del asistente */
  ASSISTANT_GREETING: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  /** Mensaje de bienvenida del wizard */
  WIZARD_GREETING: '¡Hola! Soy tu asistente de configuración inteligente. Vamos a crear tu primer Agente de Voz en menos de un minuto. Primero, ¿cómo te gustaría llamar a tu agente?',
  /** Prompt de sistema por defecto */
  DEFAULT_SYSTEM_PROMPT: 'Eres un asistente de voz amigable y profesional.',
  /** Error genérico */
  GENERIC_ERROR: 'Ha ocurrido un error. Por favor, intenta de nuevo.',
} as const;

// ============================================================
// COLORES Y UI
// ============================================================

/** Colores predeterminados de la aplicación */
export const COLORS = {
  /** Color primario */
  PRIMARY: '#3B82F6',
  /** Color de éxito */
  SUCCESS: '#22C55E',
  /** Color de advertencia */
  WARNING: '#F59E0B',
  /** Color de error */
  ERROR: '#EF4444',
} as const;

// ============================================================
// TIEMPOS
// ============================================================

/** Tiempos de espera y delays */
export const TIMINGS = {
  /** Delay simulado para desarrollo (ms) */
  SIMULATED_DELAY: 800,
  /** Timeout de WebSocket (ms) */
  WEBSOCKET_TIMEOUT: 30000,
  /** Tiempo de expiración de sesión (ms) */
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
} as const;
