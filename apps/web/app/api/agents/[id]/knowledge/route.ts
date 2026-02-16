/**
 * API de Base de Conocimiento de Agente
 * 
 * @description Gestiona la carga y eliminación de documentos en la base de conocimiento
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  logApi,
} from '@/lib/api-utils';

// ============================================================
// TIPOS
// ============================================================

interface KnowledgeDocument {
  id: string;
  agent_id: string;
  content_text: string | null;
  embedding_vector: number[] | null;
  file_name: string | null;
  created_at: string;
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 1000; // ~250 tokens
const CHUNK_OVERLAP = 200;

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Obtiene el cliente de OpenAI
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[KNOWLEDGE] Missing OPENAI_API_KEY');
    return null;
  }
  return new OpenAI({ apiKey });
}

/**
 * Limpia el texto extraído
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Divide el texto en chunks con overlap
 */
function splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

/**
 * Extrae texto de un archivo PDF
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse es un módulo CommonJS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('[KNOWLEDGE] PDF extraction error:', error);
    throw new Error('Error al extraer texto del PDF');
  }
}

/**
 * Extrae texto de un archivo según su tipo
 */
async function extractText(file: File, buffer: Buffer): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }
  
  // Archivo de texto plano
  return buffer.toString('utf-8');
}

/**
 * Genera embedding para un chunk de texto
 */
async function generateEmbedding(text: string, openai: OpenAI): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    encoding_format: 'float',
  });
  
  return response.data[0].embedding;
}

// ============================================================
// HANDLERS
// ============================================================

/**
 * POST /api/agents/[id]/knowledge
 * Carga un documento a la base de conocimiento
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const startTime = Date.now();
  const agentId = params.id;
  
  try {
    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse();
    }

    // Verificar OpenAI
    const openai = getOpenAIClient();
    if (!openai) {
      return errorResponse('Configuración de servidor incompleta', 500);
    }

    // Obtener archivo del formulario
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No se proporcionó archivo', 400);
    }

    // Validar tamaño (máximo 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return errorResponse('El archivo excede el tamaño máximo de 10MB', 400);
    }

    // Extraer texto
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractText(file, buffer);
    const cleanedText = cleanText(rawText);

    if (cleanedText.length < 50) {
      return errorResponse('El archivo contiene muy poco texto para procesar', 400);
    }

    // Dividir en chunks
    const chunks = splitIntoChunks(cleanedText, CHUNK_SIZE, CHUNK_OVERLAP);
    
    logApi('/api/agents/[id]/knowledge', 'POST', 'success', {
      agentId,
      fileName: file.name,
      fileSize: file.size,
      textLength: cleanedText.length,
      chunkCount: chunks.length,
    });

    // Procesar cada chunk
    let successCount = 0;
    let errorCount = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk, openai);

        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            agent_id: agentId,
            content_text: chunk,
            embedding_vector: embedding as any, // Supabase espera vector
            file_name: file.name,
          });

        if (error) {
          console.error('[KNOWLEDGE] Insert error:', error.message);
          errorCount++;
          
          // Error específico de columna faltante
          if (error.message.includes('file_name')) {
            return errorResponse(
              'Esquema de base de datos desactualizado. Ejecute las migraciones.',
              500
            );
          }
        } else {
          successCount++;
        }
      } catch (chunkError) {
        console.error('[KNOWLEDGE] Chunk processing error:', chunkError);
        errorCount++;
      }
    }

    const duration = Date.now() - startTime;
    logApi('/api/agents/[id]/knowledge', 'POST', 'success', {
      agentId,
      fileName: file.name,
      successCount,
      errorCount,
      duration: `${duration}ms`,
    });

    return successResponse({
      fileName: file.name,
      chunksProcessed: successCount,
      chunksFailed: errorCount,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApi('/api/agents/[id]/knowledge', 'POST', 'error', {
      agentId,
      error: String(error),
      duration: `${duration}ms`,
    });
    return errorResponse('Error interno del servidor', 500);
  }
}

/**
 * DELETE /api/agents/[id]/knowledge
 * Elimina documentos de la base de conocimiento por nombre de archivo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const agentId = params.id;
  
  try {
    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse();
    }

    // Obtener nombre de archivo
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return errorResponse('Se requiere el nombre del archivo', 400);
    }

    // Eliminar documentos
    const { error, count } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('agent_id', agentId)
      .eq('file_name', fileName);

    if (error) {
      console.error('[KNOWLEDGE] Delete error:', error.message);
      return errorResponse('Error al eliminar documento', 500);
    }

    logApi('/api/agents/[id]/knowledge', 'DELETE', 'success', {
      agentId,
      fileName,
      deletedCount: count,
    });

    return successResponse({ deleted: true, fileName });
  } catch (error) {
    logApi('/api/agents/[id]/knowledge', 'DELETE', 'error', {
      agentId,
      error: String(error),
    });
    return errorResponse('Error interno del servidor', 500);
  }
}

/**
 * GET /api/agents/[id]/knowledge
 * Lista los documentos en la base de conocimiento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const agentId = params.id;
  
  try {
    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse();
    }

    // Obtener documentos únicos por nombre de archivo
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('file_name, created_at')
      .eq('agent_id', agentId)
      .not('file_name', 'is', null);

    if (error) {
      console.error('[KNOWLEDGE] Fetch error:', error.message);
      return errorResponse('Error al obtener documentos', 500);
    }

    // Agrupar por nombre de archivo
    const documents = data.reduce((acc: Record<string, { fileName: string; chunks: number; createdAt: string }>, doc) => {
      const fileName = doc.file_name;
      if (!fileName) return acc;
      
      if (!acc[fileName]) {
        acc[fileName] = {
          fileName,
          chunks: 0,
          createdAt: doc.created_at,
        };
      }
      acc[fileName].chunks++;
      return acc;
    }, {});

    return successResponse(Object.values(documents));
  } catch (error) {
    logApi('/api/agents/[id]/knowledge', 'GET', 'error', {
      agentId,
      error: String(error),
    });
    return errorResponse('Error interno del servidor', 500);
  }
}
