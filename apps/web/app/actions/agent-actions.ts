'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteAgent(agentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
  
  if (error) {
    console.error('Error deleting agent:', error)
    throw new Error('Failed to delete agent')
  }

  revalidatePath('/agents')
}

export async function toggleAgentStatus(agentId: string, currentStatus: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('agents')
    .update({ is_active: !currentStatus })
    .eq('id', agentId)

  if (error) {
    console.error('Error updating agent status:', error)
    throw new Error('Failed to update agent status')
  }

  revalidatePath('/agents')
}

interface UpdateAgentData {
  name: string
  system_prompt: string
  phone_number_id: string
  is_active: boolean
  voice_settings: any
  widget_settings?: any
}

export async function updateAgent(agentId: string, data: UpdateAgentData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('agents')
    .update({
      name: data.name,
      system_prompt: data.system_prompt,
      phone_number_id: data.phone_number_id,
      is_active: data.is_active,
      voice_settings: data.voice_settings,
      widget_settings: data.widget_settings
    })
    .eq('id', agentId)

  if (error) {
    console.error('Error updating agent:', error)
    return { error: 'Failed to update agent' }
  }

  revalidatePath(`/agents/${agentId}/settings`)
  revalidatePath('/agents')
  return { success: true }
}

export async function getAgentFiles(agentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Fetch distinct file names
  // Supabase doesn't have a direct 'distinct' query builder method easily exposed for a single column return without raw SQL or grouping?
  // We can select file_name and then filter in JS, or use .select('file_name').eq('agent_id', agentId) and remove duplicates.
  // Ideally, use: .rpc() if we had a function, or just fetch all and unique.
  
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('file_name')
    .eq('agent_id', agentId)

  if (error) {
    console.error('Error fetching files:', error)
    return []
  }

  // Deduplicate
  const files = Array.from(new Set(data.map(item => item.file_name).filter(Boolean))) as string[]
  return files
}
