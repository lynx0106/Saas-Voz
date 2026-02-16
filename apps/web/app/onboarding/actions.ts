'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(agentName: string) {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user found')

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData?.organization_id) {
      console.error('Error fetching org:', userError)
      throw new Error('Organization not found')
    }

    // Create the agent
    const { error: insertError } = await supabase
      .from('agents')
      .insert({
        organization_id: userData.organization_id,
        name: agentName,
        is_active: true,
        // Default settings - usando la estructura correcta de VoiceSettings
        voice_settings: { 
          provider: 'openai', 
          voiceId: 'alloy',
          speed: 1.0,
          language: 'es-ES'
        },
        system_prompt: 'Eres un asistente útil y amable.'
      })

    if (insertError) {
      console.error('Error creating agent:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }

  } catch (error) {
    console.error('Server Action Error:', error)
    return { success: false, error: 'Failed to create agent' }
  }
}
