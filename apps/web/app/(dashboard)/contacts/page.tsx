import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { ContactsTable } from './contacts-table'

function ContactsTableSkeleton() {
  return (
    <div className="border rounded-md bg-white overflow-hidden">
      <div className="bg-gray-50 border-b p-4 grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
           <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-5 gap-4 items-center">
             <div className="h-6 bg-gray-100 animate-pulse rounded w-24" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-32" />
             <div className="h-4 bg-gray-100 animate-pulse rounded w-20" />
             <div className="h-8 bg-gray-100 animate-pulse rounded w-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-muted-foreground">Gestiona tu base de datos de clientes.</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      <Suspense fallback={<ContactsTableSkeleton />}>
        <ContactsTable />
      </Suspense>
    </div>
  )
}
