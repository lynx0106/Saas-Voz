import { createClient } from '@/utils/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { MoreHorizontal, User, Phone, Mail } from 'lucide-react'

export async function ContactsTable() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', userData?.organization_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha de Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!customers || customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <User className="h-8 w-8 mb-2 opacity-20" />
                  <p>No hay contactos registrados.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name || 'Sin Nombre'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-muted-foreground" />
                    {customer.phone}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.email ? (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-muted-foreground" />
                      {customer.email}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">--</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(customer.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
