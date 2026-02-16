import { createClient } from '@/utils/supabase/server'
import { Header } from './header'

export async function DashboardHeader({ userEmail }: { userEmail: string }) {
  const supabase = createClient()
  
  const { data: userData } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('email', userEmail)
    .single()
  
  const organization = userData?.organizations
  const walletBalance = organization?.wallet_balance || 0

  return <Header userEmail={userEmail} walletBalance={walletBalance} />
}
