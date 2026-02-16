import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CallsTable } from './calls-table'

function CallsTableSkeleton() {
  return (
    <div className="border rounded-md bg-white overflow-hidden">
      <div className="bg-gray-50 border-b p-4 grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
           <div key={i} className="h-4 bg-gray-200 rounded w-16"></div>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-6 gap-4 items-center">
             <div className="h-6 bg-gray-100 animate-pulse rounded w-20" />
             <div className="space-y-2">
               <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
               <div className="h-3 bg-gray-50 animate-pulse rounded w-16" />
             </div>
             <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-16" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-32" />
             <div className="h-8 bg-gray-100 animate-pulse rounded w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CallsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Historial de Llamadas</h1>
          <p className="text-muted-foreground">Revisa las grabaciones y transcripciones de las llamadas.</p>
        </div>
      </div>

      <Suspense fallback={<CallsTableSkeleton />}>
        <CallsTable />
      </Suspense>
    </div>
  )
}
