/**
 * API del Asistente Global
 * 
 * @description Asistente virtual para navegación y ayuda en el dashboard
 * @version 2.0.0
 */

import { NextResponse } from 'next/server';
import {
  successResponse,
  errorResponse,
  parseBody,
  simulateDelay,
  simulateAIResponse,
  logApi,
} from '@/lib/api-utils';

// ============================================================
// TIPOS
// ============================================================

interface AssistantMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface AssistantRequest {
  messages: AssistantMessage[];
}

interface AssistantResponse {
  role: 'assistant';
  content: string;
}

// ============================================================
// BASE DE CONOCIMIENTO DEL ASISTENTE
// ============================================================

const KNOWLEDGE_BASE: Record<string, string> = {
  // Saludos
  'hola': '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  'buenas': '¡Buenas! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  
  // Agentes
  'agente': 'Puedes gestionar tus agentes en la sección "Agentes" del menú lateral. O si prefieres, ve a la página principal y haz clic en "Nuevo Agente".',
  'crear': 'Puedes crear un nuevo agente desde el botón "Nuevo Agente" en el dashboard principal. Te guiaré paso a paso en el proceso.',
  'nuevo': 'Para crear algo nuevo, usa los botones de acción en cada sección. Por ejemplo, "Nuevo Agente" en el dashboard.',
  
  // Llamadas
  'llamada': 'El historial de llamadas se encuentra en la sección "Llamadas". Ahí podrás ver las grabaciones y transcripciones de todas las interacciones.',
  'historial': 'El historial completo de actividad está disponible en las secciones "Llamadas" y "Contactos".',
  'grabacion': 'Las grabaciones de llamadas están disponibles en la sección "Llamadas". Haz clic en cualquier llamada para ver detalles y reproducir el audio.',
  
  // Contactos
  'contacto': 'Tus contactos están organizados en la sección "Contactos". Puedes importar listas o agregar clientes manualmente desde allí.',
  'cliente': 'La gestión de clientes se realiza en "Contactos". Puedes ver historial, notas y estadísticas de cada cliente.',
  'base de datos': 'Tu base de datos de contactos está en la sección "Contactos". Soporta importación desde Excel y exportación.',
  
  // Facturación
  'saldo': 'Para ver tu saldo, recargar créditos o descargar facturas, por favor visita la sección de "Configuración" y luego "Facturación".',
  'credito': 'Los créditos se gestionan desde "Configuración > Facturación". Puedes recargar con tarjeta o transferencia.',
  'pago': 'Los pagos se procesan de forma segura a través de Stripe. Ve a "Configuración > Facturación" para gestionar tus métodos de pago.',
  'factura': 'Las facturas están disponibles en "Configuración > Facturación". Puedes descargarlas en PDF.',
  
  // Configuración
  'configuracion': 'En "Configuración" puedes modificar los detalles de tu organización, gestionar miembros del equipo y ajustar las preferencias de tu cuenta.',
  'ajustes': 'Los ajustes de tu cuenta y organización están en la sección "Configuración" del menú lateral.',
  'perfil': 'Tu perfil personal se puede editar en "Configuración". Ahí puedes cambiar tu email, contraseña y preferencias.',
  
  // Ayuda
  'ayuda': 'Estoy aquí para ayudarte. Puedo guiarte sobre: Agentes, Llamadas, Contactos, Facturación y Configuración. ¿Qué necesitas?',
  'que puedes': 'Puedo ayudarte a navegar por la plataforma, encontrar información sobre tus agentes, llamadas, contactos y facturación. ¿Qué necesitas saber?',
};

const FALLBACK_RESPONSE = `Entiendo. Como soy una versión de demostración, mis capacidades son limitadas, pero puedo ayudarte a encontrar:

• **Agentes** - Crear y gestionar tus agentes de voz
• **Historial de Llamadas** - Ver grabaciones y transcripciones
• **Contactos** - Gestionar tu base de clientes
• **Configuración y Saldo** - Facturación y preferencias

¿Sobre qué tema necesitas información?`;

// ============================================================
// HANDLERS
// ============================================================

/**
 * Genera una respuesta del asistente
 */
function generateAssistantResponse(messages: AssistantMessage[]): AssistantResponse {
  const lastMessage = messages[messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return {
      role: 'assistant',
      content: 'No recibí un mensaje válido. ¿En qué puedo ayudarte?',
    };
  }

  const response = simulateAIResponse(
    lastMessage.content,
    KNOWLEDGE_BASE,
    FALLBACK_RESPONSE
  );

  return {
    role: 'assistant',
    content: response,
  };
}

// ============================================================
// ENDPOINT
// ============================================================

/**
 * POST /api/assistant
 * Procesa mensajes del asistente global
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parsear body
    const body = await parseBody<AssistantRequest>(req);
    
    if (body instanceof NextResponse) {
      return body; // Error response
    }

    // Validar que hay mensajes
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return errorResponse('Se requiere un array de mensajes', 400);
    }

    // Generar respuesta
    const response = generateAssistantResponse(body.messages);

    // Simular latencia de red (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await simulateDelay(600);
    }

    logApi('/api/assistant', 'POST', 'success');

    return successResponse(response);
  } catch (error) {
    logApi('/api/assistant', 'POST', 'error', { error: String(error) });
    return errorResponse('Error interno del servidor', 500);
  }
}
