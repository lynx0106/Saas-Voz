import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize Supabase Admin Client
// NEXT_PUBLIC_SUPABASE_URL está disponible en el servidor de Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for widget API');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { messages, agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 1. Fetch Agent Configuration
    // We use the service role key to bypass RLS since the widget is public
    const { data: agent, error } = await supabase
      .from('agents')
      .select('system_prompt, widget_settings')
      .eq('id', agentId)
      .single()

    if (error || !agent) {
      console.error('Error fetching agent:', error)
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // 2. Determine System Prompt
    const widgetSettings = agent.widget_settings as any || {}
    const useVoicePrompt = widgetSettings.use_voice_prompt ?? true
    
    let systemPrompt = "Eres un asistente virtual útil y amable."
    
    if (useVoicePrompt) {
      systemPrompt = agent.system_prompt || systemPrompt
    } else {
      systemPrompt = widgetSettings.custom_prompt || systemPrompt
    }

    // 3. RAG: Search Knowledge Base
    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage.content
    let contextText = ''

    if (process.env.OPENAI_API_KEY && userQuery) {
      try {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: userQuery,
          encoding_format: 'float',
        })

        const embedding = embeddingResponse.data[0].embedding

        const { data: documents, error: searchError } = await supabase.rpc('match_documents', {
          query_embedding: embedding,
          match_threshold: 0.5, // Adjust threshold as needed
          match_count: 3,
          filter_agent_id: agentId
        })

        if (!searchError && documents && documents.length > 0) {
           contextText = documents.map((doc: any) => doc.content_text).join('\n---\n')
           console.log('RAG Context found:', documents.length, 'chunks')
        }
      } catch (e) {
        console.error('RAG Error:', e)
        // Continue without context
      }
    }

    if (contextText) {
      systemPrompt += `\n\nCONTEXTO RELEVANTE (Usa esta información para responder si es pertinente):\n${contextText}`
    }

    // 4. Call OpenAI
    if (!process.env.OPENAI_API_KEY) {
        // Fallback simulation if no API key (for development/demo)
        // This ensures the widget "works" visually even without paying for OpenAI
        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({ 
            role: 'assistant', 
            content: `[Modo Demo] Hola! He recibido tu mensaje. Como no hay una API Key de OpenAI configurada, estoy respondiendo con este mensaje automático. Tu prompt configurado es: "${systemPrompt.substring(0, 50)}..."` 
        }, { headers: corsHeaders })
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'gpt-3.5-turbo', // Cost-effective model for widgets
      temperature: 0.7,
    })

    const reply = completion.choices[0].message

    return NextResponse.json(reply, { headers: corsHeaders })

  } catch (error) {
    console.error('Widget Chat Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
