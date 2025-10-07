"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { BarChart3, Users, Calendar, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusCard } from "@/components/dashboard/status-card"
import { clientService } from "@/services"
import { StatsResponse } from "@/lib/types"

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<StatsResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        const response = await clientService.getStats()
        setStats(response.stats)
      } catch (err) {
        const errorMessage = 'Failed to load dashboard statistics'
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchStats()
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Stats data from API
  const statsData = [
    {
      title: "Total Clients",
      value: stats.clients.total.toLocaleString(),
      subtitle: `${stats.clients.active} active, ${stats.clients.verified} verified`,
      icon: Users,
      iconColor: "text-blue-600",
      subtitleColor: "text-gray-600"
    },
    {
      title: "Total Bookings",
      value: stats.bookings.total.toLocaleString(),
      subtitle: `${stats.bookings.recent} recent bookings`,
      icon: Calendar,
      iconColor: "text-green-600",
      subtitleColor: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `GHS ${stats.revenue.total.toLocaleString()}`,
      subtitle: `GHS ${stats.revenue.recent_30_days.toLocaleString()} last 30 days`,
      icon: DollarSign,
      iconColor: "text-purple-600",
      subtitleColor: "text-green-600"
    },
    {
      title: "Recent Activity",
      value: stats.activity.new_clients + stats.activity.new_bookings,
      subtitle: `${stats.activity.new_clients} new clients, ${stats.activity.new_bookings} bookings`,
      icon: BarChart3,
      iconColor: "text-orange-600",
      subtitleColor: "text-blue-600"
    }
  ]

  // Booking status data
  const bookingStatus = [
    { status: "Confirmed", count: stats.bookings.confirmed, color: "bg-green-100 text-green-700" },
    { status: "Pending", count: stats.bookings.pending, color: "bg-yellow-100 text-yellow-700" },
    { status: "Cancelled", count: stats.bookings.cancelled, color: "bg-red-100 text-red-700" }
  ]

  // Client status data
  const clientStatus = [
    { status: "Active", count: stats.clients.active, color: "bg-green-100 text-green-700" },
    { status: "Verified", count: stats.clients.verified, color: "bg-blue-100 text-blue-700" },
    { status: "Inactive", count: stats.clients.inactive, color: "bg-gray-100 text-gray-700" },
    { status: "With Bookings", count: stats.clients.with_bookings, color: "bg-purple-100 text-purple-700" }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.name || "Administrator"}!
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Here&apos;s what&apos;s happening with your Kay Express operations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StatusCard
          title="Booking Status"
          items={bookingStatus}
        />

        <StatusCard
          title="Client Status"
          items={clientStatus}
        />
      </div>
    </div>
  )
}