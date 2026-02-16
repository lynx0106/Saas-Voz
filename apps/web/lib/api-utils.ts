/**
 * Utilidades compartidas para APIs de Next.js
 * 
 * @description Funciones helper para respuestas, errores y validaciones
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';

// ============================================================
// TIPOS LOCALES
// ============================================================

/** Respuesta estándar de API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// ============================================================
// RESPUESTAS ESTÁNDAR
// ============================================================

/**
 * Crea una respuesta JSON exitosa
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
  }, { status });
}

/**
 * Crea una respuesta de error
 */
export function errorResponse(
  message: string,
  status = 500,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error: message,
    ...(code && { code }),
  }, { status });
}

/**
 * Respuesta de error de autenticación
 */
export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse('No autorizado. Por favor, inicia sesión.', 401, 'UNAUTHORIZED');
}

/**
 * Respuesta de error de validación
 */
export function validationErrorResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 400, 'VALIDATION_ERROR');
}

/**
 * Respuesta de recurso no encontrado
 */
export function notFoundResponse(resource: string): NextResponse<ApiResponse> {
  return errorResponse(`${resource} no encontrado.`, 404, 'NOT_FOUND');
}

// ============================================================
// VALIDACIONES
// ============================================================

/**
 * Valida que el usuario esté autenticado
 */
export async function requireAuth(supabase: {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
  };
}): Promise<{ user: { id: string } } | NextResponse<ApiResponse>> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  return { user };
}

/**
 * Valida campos requeridos en el body
 */
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): { valid: true } | { valid: false; missing: string[] } {
  const missing = fields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  return missing.length === 0
    ? { valid: true }
    : { valid: false, missing };
}

// ============================================================
// PARSING
// ============================================================

/**
 * Parsea el body de una request con manejo de errores
 */
export async function parseBody<T>(req: Request): Promise<T | NextResponse<ApiResponse>> {
  try {
    return await req.json() as T;
  } catch {
    return errorResponse('Body JSON inválido', 400, 'INVALID_JSON');
  }
}

// ============================================================
// SIMULACIÓN (Para desarrollo)
// ============================================================

/**
 * Simula latencia de red (útil para testing de UI)
 */
export async function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simula respuesta de IA (para desarrollo sin API key)
 */
export function simulateAIResponse(
  userMessage: string,
  responses: Record<string, string>,
  fallback: string
): string {
  const lowerMessage = userMessage.toLowerCase();

  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  return fallback;
}

// ============================================================
// LOGGING
// ============================================================

/**
 * Log estructurado para APIs
 */
export function logApi(
  endpoint: string,
  method: string,
  status: 'success' | 'error',
  details?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    endpoint,
    method,
    status,
    ...details,
  };

  if (status === 'error') {
    console.error('[API ERROR]', JSON.stringify(logData));
  } else {
    console.log('[API]', JSON.stringify(logData));
  }
}
