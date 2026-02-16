import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import { AgentsTable } from './agents-table'

function AgentsTableSkeleton() {
  return (
    <div className="border rounded-md bg-white overflow-hidden">
      <div className="bg-gray-50 border-b p-4 grid grid-cols-5 gap-4">
         <div className="h-4 bg-gray-200 rounded w-20"></div>
         <div className="h-4 bg-gray-200 rounded w-16"></div>
         <div className="h-4 bg-gray-200 rounded w-16"></div>
         <div className="h-4 bg-gray-200 rounded w-24"></div>
         <div className="h-4 bg-gray-200 rounded w-10 ml-auto"></div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-5 gap-4 items-center">
             <div className="space-y-2">
               <div className="h-4 bg-gray-100 animate-pulse rounded w-32" />
               <div className="h-3 bg-gray-50 animate-pulse rounded w-24" />
             </div>
             <div className="h-6 bg-gray-100 animate-pulse rounded w-16" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-20" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
             <div className="h-8 bg-gray-100 animate-pulse rounded w-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Agentes</h1>
          <p className="text-muted-foreground">Administra tus asistentes de voz inteligentes.</p>
        </div>
        <Button asChild>
          <Link href="/onboarding" className="gap-2">
            <Plus size={16} />
            Crear Nuevo Agente
          </Link>
        </Button>
      </div>

      <Suspense fallback={<AgentsTableSkeleton />}>
        <AgentsTable />
      </Suspense>
    </div>
  )
}
