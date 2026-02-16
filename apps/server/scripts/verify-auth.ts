import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('🔄 Intentando conectar con Supabase...')
  
  // Usamos un email más estándar y aleatorio simple
  const randomId = Math.floor(Math.random() * 10000)
  const email = `usuario${randomId}@gmail.com` 
  const password = 'Password123!'

  console.log(`👤 Creando usuario de prueba: ${email}`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('❌ Error al crear usuario:', error)
    console.error('   Status:', error.status)
    console.error('   Name:', error.name)
    console.error('   Message:', error.message)
  } else {
    console.log('✅ Usuario creado exitosamente!')
    console.log('   ID:', data.user?.id)
    console.log('   Email:', data.user?.email)
    
    // Check if user was inserted into public.users table (Trigger check)
    console.log('🔄 Verificando trigger en tabla public.users...')
    
    // Esperamos un poco para que el trigger corra
    await new Promise(r => setTimeout(r, 2000))

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single()

    if (userError) {
      console.error('❌ Error al leer public.users (¿Falló el trigger?):', userError.message)
    } else {
      console.log('✅ Trigger funcionó correctamente!')
      console.log('   User en DB:', userData)
    }
  }
}

testAuth()
