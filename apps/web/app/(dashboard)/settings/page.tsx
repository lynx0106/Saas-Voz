import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, CreditCard, Users, Building, Key } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Fetch Current User & Org
  const { data: userData } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()
  
  const org = userData?.organizations

  // Fetch Team Members
  const { data: teamMembers } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', (org as { id: string })?.id || '')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Administra tu organización, facturación y equipo.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        
        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} />
                Perfil de Organización
              </CardTitle>
              <CardDescription>Información visible de tu espacio de trabajo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Nombre de la Organización</Label>
                <div className="flex gap-2">
                  <Input id="org-name" defaultValue={org?.name} />
                  <Button>Guardar</Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-id">ID de Organización</Label>
                <div className="flex gap-2">
                  <Input id="org-id" value={org?.id} readOnly className="font-mono bg-muted" />
                  <Button variant="outline" size="icon" title="Copiar ID">
                    <Key size={14} />
                  </Button>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Este ID es único para tu organización. Úsalo para integraciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Estado de Cuenta
              </CardTitle>
              <CardDescription>Gestiona tu saldo y método de pago.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 p-6 border rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Saldo Disponible</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-primary">${org?.wallet_balance?.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                  <Button className="mt-4 w-full md:w-auto">
                    Recargar Saldo
                  </Button>
                </div>

                <div className="flex-1 p-6 border rounded-xl">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Plan Actual</p>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold capitalize">{org?.plan_type || 'Trial'}</h3>
                    <Badge variant="secondary">Activo</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>✓ 5 Agentes incluidos</li>
                    <li>✓ Soporte básico</li>
                    <li>✓ API Access</li>
                  </ul>
                  <Button variant="outline" className="w-full md:w-auto">
                    Cambiar Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg">
                <p>No hay transacciones recientes.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Miembros del Equipo
                  </CardTitle>
                  <CardDescription>Gestiona quién tiene acceso a tu organización.</CardDescription>
                </div>
                <Button>Invitar Miembro</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                        <AvatarFallback>{member.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role || 'Viewer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {member.id === user.id && <Badge variant="outline">Tú</Badge>}
                       <Button variant="ghost" size="sm" disabled={member.id === user.id}>
                         Gestionar
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                API Keys
              </CardTitle>
              <CardDescription>Credenciales para integrar tus agentes externamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 bg-muted/50 rounded-md border">
                 <div className="flex items-center justify-between mb-2">
                   <p className="font-medium text-sm">Clave Secreta (Producción)</p>
                   <Badge variant="destructive">Privado</Badge>
                 </div>
                 <div className="flex gap-2">
                   <Input value="••••••••••••••••••••••••" readOnly type="password" />
                   <Button variant="outline">Revelar</Button>
                 </div>
               </div>
               <Button variant="outline" className="w-full">Generar Nueva Key</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
