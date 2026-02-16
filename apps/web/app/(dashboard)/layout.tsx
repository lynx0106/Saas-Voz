import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { AssistantBubble } from '@/components/dashboard/assistant-bubble'

function HeaderSkeleton() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
       <div className="h-4 bg-gray-100 rounded w-48 animate-pulse"></div>
       <div className="flex gap-4">
          <div className="h-8 bg-gray-100 rounded w-20 animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse"></div>
       </div>
    </header>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Suspense fallback={<HeaderSkeleton />}>
           <DashboardHeader userEmail={user.email!} />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
        <AssistantBubble />
      </div>
    </div>
  )
}
