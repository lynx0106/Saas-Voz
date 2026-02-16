import { ChatInterface } from '@/components/onboarding/chat-interface'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Optional: Check if already completed onboarding to avoid re-entry
  // For now, we allow re-entry for testing

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido a Voice AI</h1>
        <p className="text-gray-500">Configuremos tu entorno en unos segundos.</p>
      </div>
      
      <ChatInterface />
      
      <div className="mt-8 text-sm text-gray-400">
        <p>Paso 1 de 1: Creación de Agente Inicial</p>
      </div>
    </main>
  )
}
