'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// ============================================================
// TIPOS
// ============================================================

export type AuthResult = {
  success: boolean
  message?: string
  error?: string
  requiresOtp?: boolean
  email?: string
}

// ============================================================
// LOGIN
// ============================================================

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validación básica
  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son requeridos' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Mensajes de error más descriptivos
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Credenciales incorrectas' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { 
        success: false, 
        error: 'Debes confirmar tu email antes de iniciar sesión',
        requiresOtp: true,
        email 
      }
    }
    return { success: false, error: 'Error al autenticar usuario' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// ============================================================
// REGISTRO CON OTP
// ============================================================

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validación básica
  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son requeridos' }
  }

  // Validación de contraseña
  if (password.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  // Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Formato de email inválido' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'Este email ya está registrado' }
    }
    return { success: false, error: 'Error al crear usuario' }
  }

  return { 
    success: true, 
    message: 'Revisa tu email para confirmar tu cuenta',
    requiresOtp: true,
    email
  }
}

// ============================================================
// VERIFICAR OTP
// ============================================================

export async function verifyOtp(formData: FormData): Promise<AuthResult> {
  const supabase = createClient()

  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const type = (formData.get('type') as 'signup' | 'email') || 'signup'

  if (!email || !token) {
    return { success: false, error: 'Email y código son requeridos' }
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  })

  if (error) {
    if (error.message.includes('invalid')) {
      return { success: false, error: 'Código inválido o expirado' }
    }
    return { success: false, error: 'Error al verificar código' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// ============================================================
// REENVIAR OTP
// ============================================================

export async function resendOtp(formData: FormData): Promise<AuthResult> {
  const supabase = createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { success: false, error: 'Email es requerido' }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { success: false, error: 'Error al reenviar código' }
  }

  return { success: true, message: 'Código reenviado a tu email' }
}

// ============================================================
// LOGIN CON GOOGLE
// ============================================================

export async function loginWithGoogle(): Promise<AuthResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: 'Error al iniciar sesión con Google' }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { success: true }
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ============================================================
// RECUPERAR CONTRASEÑA
// ============================================================

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { success: false, error: 'Email es requerido' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password`,
  })

  if (error) {
    return { success: false, error: 'Error al enviar email de recuperación' }
  }

  return { success: true, message: 'Revisa tu email para restablecer tu contraseña' }
}
