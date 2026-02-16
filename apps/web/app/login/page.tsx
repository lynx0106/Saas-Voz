import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage({ searchParams }: { searchParams: { message: string; error: string } }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Voice AI SaaS</CardTitle>
          <CardDescription className="text-center">
            Ingresa a tu plataforma de agentes inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nombre@empresa.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            {searchParams.message && (
              <div className="p-3 text-sm text-green-600 bg-green-100 rounded-md">
                {searchParams.message}
              </div>
            )}
            {searchParams.error && (
              <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
                {searchParams.error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button formAction={login} className="w-full">
                Iniciar Sesión
              </Button>
              <Button formAction={signup} variant="outline" className="w-full">
                Registrarse
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            Al continuar, aceptas nuestros términos y condiciones.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
