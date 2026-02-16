'use client'

import { useState } from 'react'
import { login, signup, verifyOtp, resendOtp, loginWithGoogle, resetPassword, AuthResult } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react'

type View = 'login' | 'otp' | 'reset-password'

export default function LoginPage({ searchParams }: { searchParams: { message: string; error: string } }) {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AuthResult | null>(null)

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    const res = await login(formData)
    setResult(res)
    setIsLoading(false)
    
    if (res.requiresOtp) {
      setEmail(res.email || '')
      setView('otp')
    }
  }

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true)
    const res = await signup(formData)
    setResult(res)
    setIsLoading(false)
    
    if (res.success && res.requiresOtp) {
      setEmail(res.email || '')
      setView('otp')
    }
  }

  const handleVerifyOtp = async (formData: FormData) => {
    setIsLoading(true)
    formData.set('email', email)
    await verifyOtp(formData)
    setIsLoading(false)
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    const res = await resendOtp(new FormData())
    setResult(res)
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await loginWithGoogle()
    setIsLoading(false)
  }

  const handleResetPassword = async (formData: FormData) => {
    setIsLoading(true)
    const res = await resetPassword(formData)
    setResult(res)
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {view === 'otp' ? 'Verificar Email' : view === 'reset-password' ? 'Recuperar Contraseña' : 'Voice AI SaaS'}
          </CardTitle>
          <CardDescription className="text-center">
            {view === 'otp' 
              ? `Ingresa el código enviado a ${email}`
              : view === 'reset-password'
              ? 'Te enviaremos instrucciones para restablecer tu contraseña'
              : 'Plataforma de agentes de voz inteligentes'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Vista OTP */}
          {view === 'otp' && (
            <form action={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Código de verificación</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    placeholder="123456"
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {result && (
                <div className={`p-3 text-sm rounded-md ${
                  result.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {result.message || result.error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Reenviar código
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setView('login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al login
              </Button>
            </form>
          )}

          {/* Vista Reset Password */}
          {view === 'reset-password' && (
            <form action={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="nombre@empresa.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {result && (
                <div className={`p-3 text-sm rounded-md ${
                  result.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {result.message || result.error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar instrucciones'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setView('login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al login
              </Button>
            </form>
          )}

          {/* Vista Login/Signup */}
          {view === 'login' && (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="nombre@empresa.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        className="pl-10"
                        required
                      />
                    </div>
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

                  {result && !result.success && (
                    <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
                      {result.error}
                    </div>
                  )}

                  <Button 
                    formAction={handleLogin} 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Iniciar Sesión'}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => setView('reset-password')}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="nombre@empresa.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        className="pl-10"
                        placeholder="Mínimo 8 caracteres"
                        required
                      />
                    </div>
                  </div>

                  {result && (
                    <div className={`p-3 text-sm rounded-md ${
                      result.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}>
                      {result.message || result.error}
                    </div>
                  )}

                  <Button 
                    formAction={handleSignup} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

        {view === 'login' && (
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Al continuar, aceptas nuestros{' '}
              <a href="/terminos" className="underline hover:text-gray-700">
                términos y condiciones
              </a>{' '}
              y{' '}
              <a href="/privacidad" className="underline hover:text-gray-700">
                política de privacidad
              </a>
              .
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
