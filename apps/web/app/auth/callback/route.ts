/**
 * Auth Callback Route
 * 
 * @description Maneja callbacks de autenticación de Supabase:
 * - Magic link
 * - OAuth (Google, etc.)
 * - Email confirmation
 * - Password reset
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenRefresh = searchParams.get('refresh_token')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  // Log para debugging
  console.log('[AUTH CALLBACK] Type:', type, 'Code:', code ? 'present' : 'missing')

  // Caso 1: Intercambio de código por sesión (OAuth, magic link, email confirmation)
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Si es recuperación de contraseña, redirigir a la página de reset
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      
      // Redirección normal
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('[AUTH CALLBACK] Error exchanging code:', error.message)
  }

  // Caso 2: Error de autenticación
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  if (error) {
    console.error('[AUTH CALLBACK] Auth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || 'Error de autenticación')}`
    )
  }

  // Fallback: redirigir a página de error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Error al procesar autenticación')}`
  )
}
