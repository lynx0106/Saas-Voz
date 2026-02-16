/**
 * Tipos de base de datos Supabase para Voice AI SaaS
 * 
 * @description Definiciones de tipos autogeneradas y extendidas manualmente
 * @version 2.0.0
 * @lastUpdated 2026-02-16
 */

// ============================================================
// TIPOS BASE
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
  provider: 'elevenlabs' | 'openai' | 'deepgram' | 'google';
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
// TIPOS DE TABLAS
// ============================================================

/**
 * Metadatos base comunes para todas las tablas
 */
export interface BaseTimestamps {
  created_at: string;
  updated_at: string;
}

export interface SoftDelete {
  deleted_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      // ============================================================
      // ORGANIZATIONS
      // ============================================================
      organizations: {
        Row: {
          id: string;
          name: string;
          plan_type: PlanType;
          wallet_balance: number;
          billing_settings: BillingSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan_type?: PlanType;
          wallet_balance?: number;
          billing_settings?: BillingSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan_type?: PlanType;
          wallet_balance?: number;
          billing_settings?: BillingSettings;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ============================================================
      // USERS
      // ============================================================
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };

      // ============================================================
      // AGENTS
      // ============================================================
      agents: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          phone_number_id?: string | null;
          system_prompt?: string | null;
          voice_settings?: VoiceSettings;
          widget_settings?: WidgetSettings | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          phone_number_id?: string | null;
          system_prompt?: string | null;
          voice_settings?: VoiceSettings;
          widget_settings?: WidgetSettings | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };

      // ============================================================
      // KNOWLEDGE_BASE
      // ============================================================
      knowledge_base: {
        Row: {
          id: string;
          agent_id: string;
          content_text: string | null;
          /** Vector de embeddings - array de números flotantes */
          embedding_vector: number[] | null;
          file_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          content_text?: string | null;
          embedding_vector?: number[] | null;
          file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          content_text?: string | null;
          embedding_vector?: number[] | null;
          file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_base_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
          }
        ];
      };

      // ============================================================
      // CUSTOMERS
      // ============================================================
      customers: {
        Row: {
          id: string;
          organization_id: string;
          phone: string;
          name: string | null;
          email: string | null;
          reputation_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          phone: string;
          name?: string | null;
          email?: string | null;
          reputation_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          phone?: string;
          name?: string | null;
          email?: string | null;
          reputation_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };

      // ============================================================
      // CALLS
      // ============================================================
      calls: {
        Row: {
          id: string;
          organization_id: string;
          agent_id: string | null;
          customer_id: string | null;
          direction: CallDirection | null;
          duration: number;
          recording_url: string | null;
          status: CallStatus | null;
          cost: number;
          transcription: string | null;
          summary: string | null;
          sentiment: 'positive' | 'negative' | 'neutral' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          agent_id?: string | null;
          customer_id?: string | null;
          direction?: CallDirection | null;
          duration?: number;
          recording_url?: string | null;
          status?: CallStatus | null;
          cost?: number;
          transcription?: string | null;
          summary?: string | null;
          sentiment?: 'positive' | 'negative' | 'neutral' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          agent_id?: string | null;
          customer_id?: string | null;
          direction?: CallDirection | null;
          duration?: number;
          recording_url?: string | null;
          status?: CallStatus | null;
          cost?: number;
          transcription?: string | null;
          summary?: string | null;
          sentiment?: 'positive' | 'negative' | 'neutral' | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calls_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calls_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calls_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    // ============================================================
    // VIEWS
    // ============================================================
    Views: {
      [_ in never]: never;
    };

    // ============================================================
    // FUNCTIONS
    // ============================================================
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
          filter_agent_id: string;
        };
        Returns: {
          id: string;
          content_text: string;
          similarity: number;
        }[];
      };
    };

    // ============================================================
    // ENUMS
    // ============================================================
    Enums: {
      plan_type: PlanType;
      user_role: UserRole;
      call_direction: CallDirection;
      call_status: CallStatus;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ============================================================
// TIPOS HELPER
// ============================================================

/** Extrae el tipo Row de una tabla */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Extrae el tipo Insert de una tabla */
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Extrae el tipo Update de una tabla */
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// ============================================================
// TIPOS ESPECÍFICOS DE ENTIDADES
// ============================================================

export type Organization = Tables<'organizations'>;
export type User = Tables<'users'>;
export type Agent = Tables<'agents'>;
export type KnowledgeBase = Tables<'knowledge_base'>;
export type Customer = Tables<'customers'>;
export type Call = Tables<'calls'>;

// ============================================================
// TIPOS DE RESPUESTA Y UTILIDADES
// ============================================================

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Error de Supabase */
export interface SupabaseError {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}

/** Resultado de operación de base de datos */
export type DbResult<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: SupabaseError;
};

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
