import { createClient } from '@/utils/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Clock, Phone, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export async function CallsTable() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch User's Organization
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  // Fetch Calls with Agent and Customer details
  const { data: calls } = await supabase
    .from('calls')
    .select(`
      *,
      agents (name),
      customers (name, phone)
    `)
    .eq('organization_id', userData?.organization_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Agente</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!calls || calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Phone className="h-8 w-8 mb-2 opacity-20" />
                  <p>No hay llamadas registradas aún.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>
                  <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                    {call.status === 'completed' ? 'Completada' : call.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{call.customers?.name || 'Desconocido'}</span>
                    <span className="text-xs text-muted-foreground">{call.customers?.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {call.agents?.name || 'Agente Eliminado'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={14} />
                    {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : '--'}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(call.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/calls/${call.id}`}>
                      <Eye size={16} className="mr-2" />
                      Detalles
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
