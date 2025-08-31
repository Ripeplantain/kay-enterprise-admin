"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
 
  LogOut,
  User,
  Bus,
  Route,
  MapPin,
  Calendar,
  CreditCard,
  Luggage,
  TicketCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CoreLayoutProps {
  children: React.ReactNode
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Kay Express</h2>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </li>
            
            {/* Client Management */}
            <li>
              <Link
                href="/clients"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Users className="w-4 h-4" />
                Clients
              </Link>
            </li>
            
            {/* Fleet Management */}
            <li>
              <Link
                href="/buses"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Bus className="w-4 h-4" />
                Buses
              </Link>
            </li>
            <li>
              <Link
                href="/terminals"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Terminals
              </Link>
            </li>
            
            {/* Route & Trip Management */}
            <li>
              <a
                href="/routes"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Route className="w-4 h-4" />
                Routes
              </a>
            </li>
            <li>
              <a
                href="/trips"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Trips
              </a>
            </li>
            
            {/* Booking Management */}
            <li>
              <a
                href="/bookings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <TicketCheck className="w-4 h-4" />
                Bookings
              </a>
            </li>
            
            {/* Payment Processing */}
            <li>
              <a
                href="/payments"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Payments
              </a>
            </li>
            
            {/* Luggage Management */}
            <li>
              <a
                href="/luggage"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Luggage className="w-4 h-4" />
                Luggage
              </a>
            </li>
            
            {/* Analytics */}
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </a>
            </li>
            
            {/* Settings */}
            <li>
              <a
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </a>
            </li>
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{session?.user?.name || "Admin"}</p>
                <p className="text-slate-400">{session?.user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome back, {session?.user?.name || "Administrator"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}