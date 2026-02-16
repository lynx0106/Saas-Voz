'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Wallet } from "lucide-react"

interface HeaderProps {
  userEmail: string
  walletBalance: number
}

export function Header({ userEmail, walletBalance }: HeaderProps) {
  const initial = userEmail[0].toUpperCase()

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs could go here */}
        <span className="text-sm text-gray-500">Organización de {userEmail.split('@')[0]}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200 gap-2">
            <Wallet size={14} />
            <span>${walletBalance.toFixed(2)}</span>
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="cursor-pointer hover:ring-2 ring-primary ring-offset-2 transition-all">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">{initial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{userEmail}</DropdownMenuItem>
            <DropdownMenuItem>Facturación</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
