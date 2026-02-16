/**
 * API de Chat para Onboarding Interview
 * 
 * @description Maneja la conversación del wizard de onboarding
 * @version 2.0.0
 */

import { NextResponse } from 'next/server';
import {
  successResponse,
  errorResponse,
  parseBody,
  simulateDelay,
  logApi,
} from '@/lib/api-utils';

// ============================================================
// TIPOS
// ============================================================

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

interface ChatResponse {
  role: 'assistant';
  content: string;
  nextStep: 'continue' | 'finish';
}

// ============================================================
// CONFIGURACIÓN DEL WIZARD
// ============================================================

interface WizardStep {
  id: number;
  question: string;
  field: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    question: '¡Me encanta ese nombre! "{name}" suena profesional. Ahora, ¿cuál será el objetivo principal de este agente? (Ej: Ventas, Soporte Técnico, Reservas)',
    field: 'goal',
  },
  {
    id: 2,
    question: 'Entendido. Para ese objetivo, el tono es clave. ¿Cómo te gustaría que hable el agente? (Ej: Formal y serio, Amigable y entusiasta, o Empático)',
    field: 'tone',
  },
  {
    id: 3,
    question: '¡Perfecto! Tengo todo lo necesario. Estoy configurando tu agente ahora mismo... 🚀',
    field: 'complete',
  },
];

const FALLBACK_RESPONSE = '¿Podrías darme más detalles para entender mejor lo que necesitas?';

// ============================================================
// HANDLERS
// ============================================================

/**
 * Determina la respuesta basada en el estado de la conversación
 */
function generateResponse(messages: ChatMessage[]): ChatResponse {
  const userMessages = messages.filter(m => m.role === 'user');
  const userMessageCount = userMessages.length;
  const lastUserMessage = userMessages[userMessages.length - 1];

  // Determinar el paso actual
  const currentStep = WIZARD_STEPS.find(step => step.id === userMessageCount);

  if (currentStep) {
    let responseText = currentStep.question;

    // Reemplazar placeholders si existen
    if (currentStep.field === 'goal' && lastUserMessage) {
      responseText = responseText.replace('{name}', lastUserMessage.content);
    }

    return {
      role: 'assistant',
      content: responseText,
      nextStep: currentStep.field === 'complete' ? 'finish' : 'continue',
    };
  }

  // Si ya completó todos los pasos
  if (userMessageCount > WIZARD_STEPS.length) {
    return {
      role: 'assistant',
      content: 'Tu agente ya está configurado. Serás redirigido al dashboard.',
      nextStep: 'finish',
    };
  }

  return {
    role: 'assistant',
    content: FALLBACK_RESPONSE,
    nextStep: 'continue',
  };
}

// ============================================================
// ENDPOINT
// ============================================================

/**
 * POST /api/chat
 * Procesa mensajes del wizard de onboarding
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parsear body
    const body = await parseBody<ChatRequest>(req);
    
    if (body instanceof NextResponse) {
      return body; // Error response
    }

    // Validar que hay mensajes
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return errorResponse('Se requiere un array de mensajes', 400);
    }

    // Generar respuesta
    const response = generateResponse(body.messages);

    // Simular latencia de red para realismo (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await simulateDelay(800);
    }

    logApi('/api/chat', 'POST', 'success', { 
      messageCount: body.messages.length,
      nextStep: response.nextStep 
    });

    return successResponse(response);
  } catch (error) {
    logApi('/api/chat', 'POST', 'error', { error: String(error) });
    return errorResponse('Error interno del servidor', 500);
  }
}
