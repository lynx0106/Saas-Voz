'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Phone, Settings, LogOut, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Bot, label: 'Agentes', href: '/agents' },
  { icon: Phone, label: 'Llamadas', href: '/calls' },
  { icon: Users, label: 'Contactos', href: '/contacts' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-primary" />
          <span>Voice AI</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
              )}>
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <form action="/auth/signout" method="post">
           <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3">
             <LogOut size={20} />
             <span>Cerrar Sesión</span>
           </Button>
        </form>
      </div>
    </div>
  )
}
