'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2, FileText, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface KnowledgeBaseProps {
  agentId: string
  files: string[]
}

export function KnowledgeBase({ agentId, files: initialFiles }: KnowledgeBaseProps) {
  const [files, setFiles] = useState<string[]>(initialFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast({
        title: 'Formato no soportado',
        description: 'Por favor sube archivos PDF o TXT.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/agents/${agentId}/knowledge`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Error al subir archivo')

      const data = await response.json()
      setFiles(prev => [...prev, data.fileName])
      toast({
        title: 'Archivo subido',
        description: 'El documento ha sido procesado y añadido a la base de conocimiento.',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo subir el archivo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    setIsDeleting(fileName)
    try {
      const response = await fetch(`/api/agents/${agentId}/knowledge?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar archivo')

      setFiles(prev => prev.filter(f => f !== fileName))
      toast({
        title: 'Archivo eliminado',
        description: 'El documento ha sido eliminado de la base de conocimiento.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de Conocimiento</CardTitle>
        <CardDescription>
          Sube documentos (PDF, TXT) para que tu agente pueda responder preguntas específicas sobre tu negocio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="knowledge-upload">Subir documento</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              id="knowledge-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <Button disabled variant="ghost" size="icon">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Documentos activos</h4>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No hay documentos subidos.</p>
          ) : (
            <div className="grid gap-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{file}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file)}
                    disabled={isDeleting === file}
                  >
                    {isDeleting === file ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
