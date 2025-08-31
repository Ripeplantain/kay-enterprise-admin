"use client"

import { useSession } from "next-auth/react"
import { BarChart3, Package, Truck, Users } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityCard } from "@/components/dashboard/activity-card"
import { StatusCard } from "@/components/dashboard/status-card"

export default function Dashboard() {
  const { data: session } = useSession()

  // Stats data
  const statsData = [
    {
      title: "Total Orders",
      value: "2,543",
      subtitle: "+12% from last month",
      icon: Package,
      iconColor: "text-blue-600",
      subtitleColor: "text-green-600"
    },
    {
      title: "Active Deliveries", 
      value: "156",
      subtitle: "23 out for delivery",
      icon: Truck,
      iconColor: "text-orange-600",
      subtitleColor: "text-blue-600"
    },
    {
      title: "Total Customers",
      value: "8,721", 
      subtitle: "+5% from last month",
      icon: Users,
      iconColor: "text-green-600",
      subtitleColor: "text-green-600"
    },
    {
      title: "Revenue",
      value: "$45,231",
      subtitle: "+18% from last month", 
      icon: BarChart3,
      iconColor: "text-purple-600",
      subtitleColor: "text-green-600"
    }
  ]

  // Recent orders data
  const recentOrders = [1, 2, 3, 4].map((item) => ({
    id: item.toString(),
    title: `#ORD-${1000 + item}`,
    subtitle: `Customer ${item}`,
    value: `$142.${item}0`,
    timestamp: "2 min ago",
    icon: <Package className="w-4 h-4 text-gray-600" />
  }))

  // Delivery status data
  const deliveryStatus = [
    { status: "In Transit", count: 45, color: "bg-blue-100 text-blue-700" },
    { status: "Out for Delivery", count: 23, color: "bg-orange-100 text-orange-700" },
    { status: "Delivered", count: 189, color: "bg-green-100 text-green-700" },
    { status: "Pending", count: 12, color: "bg-gray-100 text-gray-700" }
  ]

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.name || "Administrator"}!
        </h2>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your Kay Express operations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard
          title="Recent Orders"
          items={recentOrders}
        />
        
        <StatusCard
          title="Delivery Status"
          items={deliveryStatus}
        />
      </div>
    </div>
  )
}