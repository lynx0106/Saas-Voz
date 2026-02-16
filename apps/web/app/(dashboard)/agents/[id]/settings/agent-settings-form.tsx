'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateAgent, getAgentFiles } from '@/app/actions/agent-actions'
import { useToast } from '@/hooks/use-toast'
import { Copy, Loader2, Save, FileText, Settings, MessageSquare, Mic } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AgentPlayground } from './agent-playground'
import { KnowledgeBase } from './knowledge-base'

interface AgentSettingsFormProps {
  agent: {
    id: string
    name: string
    system_prompt: string | null
    phone_number_id: string | null
    is_active: boolean
    voice_settings: any
    widget_settings: any
  }
}

export function AgentSettingsForm({ agent }: AgentSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const [knowledgeFiles, setKnowledgeFiles] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: agent.name || '',
    system_prompt: agent.system_prompt || '',
    phone_number_id: agent.phone_number_id || '',
    is_active: agent.is_active || false,
    // Voice settings
    voice_provider: agent.voice_settings?.provider || 'ElevenLabs',
    voice_id: agent.voice_settings?.voiceId || '',
    // Widget settings
    widget_title: agent.widget_settings?.title || 'Asistente Virtual',
    widget_color: agent.widget_settings?.primary_color || '#0f172a',
    widget_welcome: agent.widget_settings?.welcome_message || '¡Hola! ¿En qué puedo ayudarte hoy?',
    widget_use_voice_prompt: agent.widget_settings?.use_voice_prompt ?? true,
    widget_custom_prompt: agent.widget_settings?.custom_prompt || '',
    widget_enable_voice: agent.widget_settings?.enable_voice ?? true,
  })

  useEffect(() => {
    getAgentFiles(agent.id).then(setKnowledgeFiles)
  }, [agent.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }))
  }

  const handleWidgetPromptSwitch = (checked: boolean) => {
    setFormData(prev => ({ ...prev, widget_use_voice_prompt: checked }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copiado al portapapeles" })
  }

  const widgetCode = `<script>
  window.voiceAgentId = "${agent.id}";
  window.voiceAgentConfig = {
    title: "${formData.widget_title}",
    color: "${formData.widget_color}",
    welcome: "${formData.widget_welcome}",
    enableVoice: ${formData.widget_enable_voice}
  };
</script>
<script src="https://cdn.saas-agentes.com/widget.v1.js" async></script>`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = await updateAgent(agent.id, {
          name: formData.name,
          system_prompt: formData.system_prompt,
          phone_number_id: formData.phone_number_id,
          is_active: formData.is_active,
          voice_settings: {
            provider: formData.voice_provider,
            voiceId: formData.voice_id,
          },
          widget_settings: {
            title: formData.widget_title,
            primary_color: formData.widget_color,
            welcome_message: formData.widget_welcome,
            use_voice_prompt: formData.widget_use_voice_prompt,
            custom_prompt: formData.widget_custom_prompt,
            enable_voice: formData.widget_enable_voice
          }
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        toast({
          title: "Cambios guardados",
          description: "La configuración del agente ha sido actualizada.",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Configuration Column */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="knowledge">Data</TabsTrigger>
              <TabsTrigger value="widget">Widget</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompt" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comportamiento
                  </CardTitle>
                  <CardDescription>Instrucciones detalladas para la IA. Define su personalidad y objetivos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="system_prompt">System Prompt</Label>
                    <Textarea
                      id="system_prompt"
                      name="system_prompt"
                      value={formData.system_prompt}
                      onChange={handleChange}
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="Eres un asistente útil y amable..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="space-y-4 mt-4">
               <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Settings className="h-5 w-5" />
                       Información General
                    </CardTitle>
                    <CardDescription>Detalles básicos de tu agente.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Agente</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Asistente de Ventas"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone_number_id">ID de Teléfono (Provider)</Label>
                      <Input
                        id="phone_number_id"
                        name="phone_number_id"
                        value={formData.phone_number_id}
                        onChange={handleChange}
                        placeholder="ID del número telefónico"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Estado Activo</Label>
                        <p className="text-sm text-muted-foreground">
                          Responderá llamadas.
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Mic className="h-5 w-5" />
                       Configuración de Voz
                    </CardTitle>
                    <CardDescription>Define cómo suena tu agente.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="voice_provider">Proveedor de Voz</Label>
                      <Input
                        id="voice_provider"
                        name="voice_provider"
                        value={formData.voice_provider}
                        onChange={handleChange}
                        placeholder="Ej. ElevenLabs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voice_id">ID de Voz</Label>
                      <Input
                        id="voice_id"
                        name="voice_id"
                        value={formData.voice_id}
                        onChange={handleChange}
                        placeholder="ID de la voz a utilizar"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4 mt-4">
              <KnowledgeBase agentId={agent.id} files={knowledgeFiles} />
            </TabsContent>

            <TabsContent value="widget" className="space-y-4 mt-4">
               <Card>
                <CardHeader>
                  <CardTitle>Integración Web (Widget)</CardTitle>
                  <CardDescription>Configura el chat que aparecerá en tu sitio web.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="widget_title">Título del Widget</Label>
                      <Input
                        id="widget_title"
                        name="widget_title"
                        value={formData.widget_title}
                        onChange={handleChange}
                        placeholder="Asistente Virtual"
                      />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="widget_color">Color Principal</Label>
                       <div className="flex gap-2">
                         <Input
                           id="widget_color"
                           name="widget_color"
                           type="color"
                           value={formData.widget_color}
                           onChange={handleChange}
                           className="w-12 p-1 h-10"
                         />
                         <Input
                            value={formData.widget_color}
                            onChange={handleChange}
                            name="widget_color"
                            className="flex-1"
                         />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widget_welcome">Mensaje de Bienvenida</Label>
                    <Input
                      id="widget_welcome"
                      name="widget_welcome"
                      value={formData.widget_welcome}
                      onChange={handleChange}
                      placeholder="¡Hola! ¿En qué puedo ayudarte?"
                    />
                  </div>

                  <div className="pt-4 border-t space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Inteligencia Artificial</Label>
                          <p className="text-sm text-muted-foreground">
                            {formData.widget_use_voice_prompt 
                              ? "Usando el mismo 'System Prompt' que el Agente de Voz." 
                              : "Usando un prompt personalizado para el chat web."}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">Entrenar aparte</span>
                          <Switch
                            checked={formData.widget_use_voice_prompt}
                            onCheckedChange={handleWidgetPromptSwitch}
                          />
                          <span className="text-xs font-medium">Usar Prompt de Voz</span>
                        </div>
                     </div>

                     {!formData.widget_use_voice_prompt && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                          <Label htmlFor="widget_custom_prompt">Prompt del Widget Web</Label>
                          <Textarea
                            id="widget_custom_prompt"
                            name="widget_custom_prompt"
                            value={formData.widget_custom_prompt}
                            onChange={handleChange}
                            className="min-h-[150px] font-mono text-sm"
                            placeholder="Instrucciones específicas para el chat web (ej. puedes enviar enlaces, imágenes...)"
                          />
                        </div>
                     )}
                  </div>
                  
                  <div className="bg-slate-950 text-slate-50 p-4 rounded-lg relative font-mono text-xs overflow-x-auto">
                     <Button 
                       size="icon" 
                       variant="secondary" 
                       className="absolute top-2 right-2 h-8 w-8"
                       onClick={(e) => { e.preventDefault(); copyToClipboard(widgetCode); }}
                       type="button"
                     >
                       <Copy size={14} />
                     </Button>
                     <pre>{widgetCode}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Playground Column */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <AgentPlayground 
             systemPrompt={formData.system_prompt} 
             voiceId={formData.voice_id} 
             agentId={agent.id}
          />
        </div>
      </div>
    </div>
  )
}
