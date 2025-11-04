"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  User,
  Bus,
  Route,
  Calendar,
  CreditCard,
  Luggage,
  TicketCheck,
  Menu,
  X,
  UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CoreLayoutProps {
  children: React.ReactNode
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-slate-800 text-white flex flex-col h-full
      `}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Kay Express</h2>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </li>
            
            {/* Client Management */}
            <li>
              <Link
                href="/clients"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/clients")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                Clients
              </Link>
            </li>
            
            {/* Fleet Management */}
            <li>
              <Link
                href="/buses"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/buses")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Bus className="w-4 h-4" />
                Buses
              </Link>
            </li>

            {/* Route & Trip Management */}
            <li>
              <Link
                href="/routes"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/routes")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Route className="w-4 h-4" />
                Routes
              </Link>
            </li>
            <li>
              <Link
                href="/trips"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/trips")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Trips
              </Link>
            </li>

            {/* Booking Management */}
            <li>
              <Link
                href="/bookings"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/bookings")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <TicketCheck className="w-4 h-4" />
                Bookings
              </Link>
            </li>

            {/* Payment Processing */}
            <li>
              <Link
                href="/payments"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/payments")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Payments
              </Link>
            </li>

            {/* Luggage Management */}
            <li>
              <Link
                href="/luggage"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/luggage")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Luggage className="w-4 h-4" />
                Luggage
              </Link>
            </li>

            {/* Agent Management */}
            <li>
              <Link
                href="/agents"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/agents")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Agents
              </Link>
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
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="sm"
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome back, {session?.user?.name || "Administrator"}
              </span>
              <span className="text-xs text-gray-600 sm:hidden">
                {session?.user?.name || "Admin"}
              </span>
            </div>
            {/* Mobile logout button */}
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="lg:hidden"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
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