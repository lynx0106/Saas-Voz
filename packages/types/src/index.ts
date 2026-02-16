/**
 * Tipos compartidos para Voice AI SaaS
 * 
 * @description Este archivo exporta tipos que se comparten entre apps/web y apps/server
 * @version 2.0.0
 * @lastUpdated 2026-02-16
 * 
 * NOTA: Estos tipos están sincronizados con apps/web/types/supabase.ts
 * Si modificas uno, asegúrate de actualizar el otro.
 */

// ============================================================
// ENUMS Y TIPOS DE UNIÓN
// ============================================================

/** Tipos de plan disponibles */
export type PlanType = 'free' | 'pro' | 'enterprise';

/** Roles de usuario dentro de una organización */
export type UserRole = 'owner' | 'admin' | 'viewer';

/** Dirección de una llamada */
export type CallDirection = 'inbound' | 'outbound';

/** Estados posibles de una llamada */
export type CallStatus = 'pending' | 'ringing' | 'active' | 'completed' | 'failed' | 'cancelled';

/** Proveedores de voz soportados */
export type VoiceProvider = 'elevenlabs' | 'openai' | 'deepgram' | 'google';

// ============================================================
// INTERFACES PARA CAMPOS JSON
// ============================================================

/**
 * Configuración de facturación de una organización
 */
export interface BillingSettings {
  /** ID del método de pago en Stripe */
  paymentMethodId?: string;
  /** Moneda predeterminada */
  currency: 'USD' | 'EUR' | 'COP' | 'MXN';
  /** Recarga automática habilitada */
  autoRecharge: boolean;
  /** Umbral para activar recarga automática (en centavos) */
  rechargeThreshold: number;
  /** Monto de recarga automática (en centavos) */
  rechargeAmount: number;
  /** Información fiscal */
  taxInfo?: {
    taxId?: string;
    taxType?: string;
    country?: string;
  };
}

/**
 * Configuración de voz para un agente
 */
export interface VoiceSettings {
  /** Proveedor de TTS/STT */
  provider: VoiceProvider;
  /** ID de la voz seleccionada */
  voiceId: string;
  /** Estabilidad de la voz (0-1) - Solo ElevenLabs */
  stability?: number;
  /** Boost de similitud (0-1) - Solo ElevenLabs */
  similarityBoost?: number;
  /** Velocidad de reproducción (0.5-2) */
  speed: number;
  /** Idioma/código de idioma */
  language: string;
  /** Pitch de la voz (-20 a 20) */
  pitch?: number;
}

/**
 * Configuración del widget de chat para un agente
 */
export interface WidgetSettings {
  /** Color primario del widget (hex) */
  primaryColor: string;
  /** Posición del widget en la pantalla */
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Mensaje de bienvenida */
  greetingMessage: string;
  /** Mostrar avatar del agente */
  showAvatar: boolean;
  /** Dominios permitidos para embed */
  allowedDomains: string[];
  /** Título del widget */
  title?: string;
  /** Mostrar indicador de escritura */
  showTypingIndicator?: boolean;
  /** Tiempo de espera máximo (ms) */
  timeout?: number;
}

// ============================================================
// ENTIDADES PRINCIPALES
// ============================================================

/**
 * Organización (tenant) en el sistema multi-tenant
 */
export interface Organization {
  id: string;
  name: string;
  plan_type: PlanType;
  wallet_balance: number;
  billing_settings: BillingSettings;
  created_at: string;
  updated_at: string;
}

/**
 * Usuario del sistema
 */
export interface User {
  id: string;
  organization_id: string | null;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Agente de voz IA
 */
export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  phone_number_id: string | null;
  system_prompt: string | null;
  voice_settings: VoiceSettings;
  widget_settings: WidgetSettings | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Registro en la base de conocimiento de un agente
 */
export interface KnowledgeBase {
  id: string;
  agent_id: string;
  content_text: string | null;
  embedding_vector: number[] | null;
  file_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Cliente/Contacto de una organización
 */
export interface Customer {
  id: string;
  organization_id: string;
  phone: string;
  name: string | null;
  email: string | null;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

/**
 * Registro de llamada
 */
export interface Call {
  id: string;
  organization_id: string;
  agent_id: string | null;
  customer_id: string | null;
  direction: CallDirection | null;
  duration: number;
  recording_url: string | null;
  status: CallStatus | null;
  cost: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TIPOS DE WEBSOCKET
// ============================================================

/** Mensajes del cliente al servidor */
export type ClientMessage =
  | { type: 'setup'; agentId: string }
  | { type: 'conversation_input'; text: string }
  | { type: 'audio_input'; audio: string } // Base64 encoded
  | { type: 'ping' };

/** Mensajes del servidor al cliente */
export type ServerMessage =
  | { type: 'ready' }
  | { type: 'audio_delta'; text: string }
  | { type: 'audio_output'; audio: string } // Base64 encoded
  | { type: 'end_of_turn' }
  | { type: 'error'; message: string }
  | { type: 'pong' };

// ============================================================
// TIPOS DE API
// ============================================================

/** Respuesta estándar de API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Respuesta paginada */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// VALORES POR DEFECTO
// ============================================================

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  provider: 'openai',
  voiceId: 'alloy',
  speed: 1.0,
  language: 'es-ES',
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  primaryColor: '#3B82F6',
  position: 'bottom-right',
  greetingMessage: '¡Hola! ¿En qué puedo ayudarte?',
  showAvatar: true,
  allowedDomains: [],
};

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  currency: 'USD',
  autoRecharge: false,
  rechargeThreshold: 500, // $5.00
  rechargeAmount: 1000, // $10.00
};

// ============================================================
// TIPOS DE UTILIDAD
// ============================================================

/** Hace que todas las propiedades sean opcionales excepto las especificadas */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Extrae el tipo de los elementos de un array */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/** Hace que las propiedades sean no nulas */
export type NonNullableProps<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>;
};
