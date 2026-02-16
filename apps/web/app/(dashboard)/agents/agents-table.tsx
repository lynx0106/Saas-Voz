import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AgentActions } from './agent-actions'

export async function AgentsTable() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  // Simulate delay to show skeleton (remove in prod if not needed, but good for UX feel testing)
  // await new Promise(resolve => setTimeout(resolve, 1000))

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('organization_id', userData?.organization_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Voz</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No tienes agentes creados.
              </TableCell>
            </TableRow>
          ) : (
            agents?.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{agent.name}</span>
                    <span className="text-xs text-muted-foreground">{agent.phone_number_id || 'Sin número asignado'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={agent.is_active ? "default" : "secondary"}>
                    {agent.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {(agent.voice_settings as any)?.provider || 'ElevenLabs'}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(agent.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <AgentActions agent={agent} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
