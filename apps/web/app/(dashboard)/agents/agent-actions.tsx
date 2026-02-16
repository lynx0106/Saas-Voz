'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Play, Pause, Settings as SettingsIcon, Trash2, Loader2 } from 'lucide-react'
import { deleteAgent, toggleAgentStatus } from '@/app/actions/agent-actions'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface AgentActionsProps {
  agent: {
    id: string
    is_active: boolean
    name: string
  }
}

export function AgentActions({ agent }: AgentActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const handleToggleStatus = () => {
    startTransition(async () => {
      try {
        await toggleAgentStatus(agent.id, agent.is_active)
        toast({
          title: agent.is_active ? "Agente pausado" : "Agente activado",
          description: `El agente ${agent.name} ahora está ${agent.is_active ? 'inactivo' : 'activo'}.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cambiar el estado del agente.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este agente? Esta acción no se puede deshacer.')) return

    startTransition(async () => {
      try {
        await deleteAgent(agent.id)
        toast({
          title: "Agente eliminado",
          description: `El agente ${agent.name} ha sido eliminado correctamente.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el agente.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/agents/${agent.id}/settings`} className="cursor-pointer">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Configurar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleStatus} className="cursor-pointer">
          {agent.is_active ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {agent.is_active ? "Pausar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
