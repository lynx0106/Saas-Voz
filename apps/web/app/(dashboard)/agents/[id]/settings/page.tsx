import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AgentSettingsForm } from './agent-settings-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AgentSettingsPageProps {
  params: {
    id: string
  }
}

export default async function AgentSettingsPage({ params }: AgentSettingsPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !agent) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/agents">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configuración del Agente</h1>
          <p className="text-muted-foreground">Personaliza el comportamiento y la voz de tu agente.</p>
        </div>
      </div>

      <AgentSettingsForm agent={agent} />
    </div>
  )
}
