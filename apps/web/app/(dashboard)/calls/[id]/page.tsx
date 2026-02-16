import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, FileText, Clock, User, Phone, Calendar, Download, Share2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface CallPageProps {
  params: {
    id: string
  }
}

export default async function CallPage({ params }: CallPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: call, error } = await supabase
    .from('calls')
    .select(`
      *,
      agents (name, id),
      customers (name, phone, email, id)
    `)
    .eq('id', params.id)
    .single()

  if (error || !call) {
    return notFound()
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/calls">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Detalle de Llamada</h1>
            <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
              {call.status === 'completed' ? 'Completada' : call.status}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
            <Calendar size={14} />
            {new Date(call.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 size={16} className="mr-2" />
            Compartir
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Main Content (Player & Transcript) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Audio Player Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play size={20} className="text-primary" />
                Grabación de Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {call.recording_url ? (
                <div className="bg-muted/30 p-4 rounded-md">
                  <audio controls className="w-full">
                    <source src={call.recording_url} type="audio/mpeg" />
                    <source src={call.recording_url} type="audio/wav" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                  <Play className="h-10 w-10 mb-2 opacity-20" />
                  <p>Grabación no disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Transcripción
              </CardTitle>
              <CardDescription>Texto generado automáticamente por la IA</CardDescription>
            </CardHeader>
            <CardContent>
              {call.transcription ? (
                <div className="prose prose-sm max-w-none bg-muted/30 p-6 rounded-md whitespace-pre-wrap leading-relaxed text-foreground">
                  {call.transcription}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                  <FileText className="h-10 w-10 mb-2 opacity-20" />
                  <p>Transcripción no disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata & Analysis */}
        <div className="space-y-6">
          
          {/* Analysis Card */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumen</span>
                <p className="text-sm mt-1">
                  {call.summary || "No hay resumen disponible para esta llamada."}
                </p>
              </div>
              <Separator />
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sentimiento</span>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={call.sentiment === 'positive' ? 'default' : call.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                    {call.sentiment === 'positive' ? 'Positivo' : call.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium">{call.customers?.name || 'Cliente Desconocido'}</p>
                  <p className="text-xs text-muted-foreground">ID: {call.customers?.id?.slice(0, 8)}...</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{call.customers?.phone || 'Sin teléfono'}</span>
                </div>
                {call.customers?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-muted-foreground" />
                    <span>{call.customers.email}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contacts">Ver Historial del Cliente</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Call Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Duración</span>
                  <p className="text-xl font-bold flex items-center gap-1">
                    <Clock size={16} className="text-muted-foreground" />
                    {formatDuration(call.duration || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Costo Est.</span>
                  <p className="text-xl font-bold text-muted-foreground">
                    $0.00
                  </p>
                </div>
                <div className="col-span-2 space-y-1 pt-2">
                  <span className="text-xs text-muted-foreground">Agente</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm font-medium">{call.agents?.name || 'Sistema'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
