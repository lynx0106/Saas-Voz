import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, Users, Clock, Plus, MoreHorizontal, Play, Pause, TrendingUp, Bot, AlertCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // 1. Check if user has any agents
  const { count, error } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })

  if (!error && count === 0) {
    return redirect('/onboarding')
  }

  // 2. Fetch User's Organization
  const { data: userData } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()
  
  const organization = userData?.organizations as { id: string; name: string; plan_type: string } | null
  const orgId = organization?.id || ''

  // 3. Fetch Agents List
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  // 4. Fetch Statistics
  const { count: callsCount } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  const { data: callsData } = await supabase
    .from('calls')
    .select('duration, cost')
    .eq('organization_id', orgId)

  const { count: customersCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  // Calculate totals
  const totalMinutes = callsData?.reduce((acc, call) => acc + (call.duration || 0), 0) || 0
  const totalCost = callsData?.reduce((acc, call) => acc + (call.cost || 0), 0) || 0
  const activeAgents = agents?.filter(a => a.is_active).length || 0

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            {organization?.name || 'Tu organización'} • Plan {organization?.plan_type || 'free'}
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/onboarding">
            <Plus size={18} />
            Nuevo Agente
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Llamadas Totales</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callsCount || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {activeAgents} agentes activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutos Consumidos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalMinutes)}</div>
            <p className="text-xs text-muted-foreground">
              {callsCount || 0} llamadas procesadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              En tu base de datos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              En llamadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Mis Agentes</h3>
          <Badge variant="secondary">{agents?.length || 0} agentes</Badge>
        </div>
        
        {agents && agents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent: any) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={agent.is_active ? "default" : "secondary"}>
                        {agent.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {agent.voice_settings?.provider || 'OpenAI'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/agents/${agent.id}/settings`}>Editar Configuración</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/calls?agent=${agent.id}`}>Ver Llamadas</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Voz:</span>
                      <span className="font-medium text-gray-900">
                        {agent.voice_settings?.voiceId || 'alloy'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base de conocimiento:</span>
                      <span className="font-medium text-gray-900">
                        {agent.widget_settings ? 'Configurado' : 'Sin configurar'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="w-full gap-2" asChild>
                      <Link href={`/agents/${agent.id}/settings`}>
                        {agent.is_active ? <Pause size={14} /> : <Play size={14} />}
                        {agent.is_active ? "Pausar" : "Activar"}
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/agents/${agent.id}/settings`}>
                        <Bot size={14} />
                        Entrenar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tienes agentes</h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
                Crea tu primer agente de voz en minutos. Te guiaremos paso a paso.
              </p>
              <Button asChild>
                <Link href="/onboarding">
                  <Plus size={18} className="mr-2" />
                  Crear Primer Agente
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Próximos Pasos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agents?.some(a => a.is_active) && (
              <p className="text-muted-foreground">
                • Activa un agente para comenzar a recibir llamadas
              </p>
            )}
            {agents?.some(a => !a.system_prompt) && (
              <p className="text-muted-foreground">
                • Configura el prompt de sistema de tus agentes
              </p>
            )}
            <p className="text-muted-foreground">
              • Agrega documentos a la base de conocimiento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/contacts">Importar Contactos</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/calls">Ver Historial</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">Configuración</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
