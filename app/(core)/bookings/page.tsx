"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  TicketCheck, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar,
  Clock,
  User,
  CreditCard,
  MoreHorizontal,
  Eye,
  Download
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Loader } from "@/components/ui/loader"

const mockBookings = [
  {
    id: "BK001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    route: "New York → Boston",
    departureDate: "2024-02-15",
    departureTime: "08:30 AM",
    arrivalTime: "12:30 PM",
    seatNumber: "A12",
    status: "confirmed",
    amount: 89.50,
    bookingDate: "2024-02-10",
    paymentStatus: "paid",
    busNumber: "KE-001"
  },
  {
    id: "BK002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com", 
    route: "Los Angeles → San Francisco",
    departureDate: "2024-02-16",
    departureTime: "06:00 AM",
    arrivalTime: "11:00 AM",
    seatNumber: "B08",
    status: "confirmed",
    amount: 75.00,
    bookingDate: "2024-02-12",
    paymentStatus: "paid",
    busNumber: "KE-002"
  },
  {
    id: "BK003",
    customerName: "Michael Brown",
    customerEmail: "m.brown@email.com",
    route: "Chicago → Detroit",
    departureDate: "2024-02-17",
    departureTime: "02:00 PM",
    arrivalTime: "07:30 PM", 
    seatNumber: "C15",
    status: "pending",
    amount: 65.00,
    bookingDate: "2024-02-14",
    paymentStatus: "pending",
    busNumber: "KE-003"
  },
  {
    id: "BK004",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    route: "Houston → Dallas",
    departureDate: "2024-02-14",
    departureTime: "10:00 AM",
    arrivalTime: "01:30 PM",
    seatNumber: "A05",
    status: "cancelled",
    amount: 45.00,
    bookingDate: "2024-02-08",
    paymentStatus: "refunded",
    busNumber: "KE-004"
  },
  {
    id: "BK005",
    customerName: "Robert Wilson",
    customerEmail: "r.wilson@email.com",
    route: "Miami → Orlando",
    departureDate: "2024-02-18",
    departureTime: "04:30 PM",
    arrivalTime: "08:00 PM",
    seatNumber: "B20",
    status: "confirmed",
    amount: 55.00,
    bookingDate: "2024-02-13",
    paymentStatus: "paid",
    busNumber: "KE-005"
  }
]

export default function BookingsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.route.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700"
      case "pending": return "bg-yellow-100 text-yellow-700"  
      case "cancelled": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "refunded": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const totalBookings = mockBookings.length
  const confirmedBookings = mockBookings.filter(b => b.status === "confirmed").length
  const pendingBookings = mockBookings.filter(b => b.status === "pending").length
  const totalRevenue = mockBookings
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage customer bookings and reservations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bookings
            </CardTitle>
            <TicketCheck className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalBookings}</div>
            <p className="text-xs text-green-600 mt-1">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Confirmed
            </CardTitle>
            <TicketCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{confirmedBookings}</div>
            <p className="text-xs text-blue-600 mt-1">
              {((confirmedBookings/totalBookings) * 100).toFixed(0)}% confirm rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingBookings}</div>
            <p className="text-xs text-yellow-600 mt-1">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue
            </CardTitle>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">
              From paid bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by booking ID, customer name, or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader message="Loading bookings..." />
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              icon={TicketCheck}
              title={searchTerm ? "No bookings found" : "No bookings yet"}
              description={
                searchTerm 
                  ? `No bookings match your search criteria. Try adjusting your filters.`
                  : "Bookings will appear here once customers start making reservations."
              }
              action={
                !searchTerm 
                  ? {
                      label: "Create New Booking",
                      onClick: () => console.log("Create booking clicked")
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TicketCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">{booking.id}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {booking.customerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.route}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.departureDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.departureTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Seat: {booking.seatNumber}</span>
                      <span>Bus: {booking.busNumber}</span>
                      <span>Booked: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${booking.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.departureTime} - {booking.arrivalTime}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="More Options">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}