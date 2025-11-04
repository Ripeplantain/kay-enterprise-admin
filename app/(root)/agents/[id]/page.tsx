"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useApiError } from "@/hooks/use-api-error"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { agentService } from "@/services"
import { Agent, AgentBooking } from "@/lib/types"

export default function AgentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { handleError } = useApiError()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [bookings, setBookings] = useState<AgentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsCurrentPage, setBookingsCurrentPage] = useState(1)
  const [bookingsTotalCount, setBookingsTotalCount] = useState(0)

  useEffect(() => {
    if (session?.user?.id && params.id) {
      fetchAgentDetails()
      fetchAgentBookings(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, params.id])

  const fetchAgentDetails = async () => {
    try {
      setLoading(true)
      const data = await agentService.getAgent(params.id as string)
      setAgent(data)
    } catch (error) {
      console.error("Failed to fetch agent details:", error)
      handleError(error, "Failed to load agent details")
    } finally {
      setLoading(false)
    }
  }

  const fetchAgentBookings = async (page: number) => {
    try {
      setBookingsLoading(true)
      const data = await agentService.getAgentBookings(params.id as string, page)
      setBookings(data.results)
      setBookingsTotalCount(data.count)
      setBookingsCurrentPage(page)
    } catch (error) {
      console.error("Failed to fetch agent bookings:", error)
      handleError(error, "Failed to load agent bookings")
    } finally {
      setBookingsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchAgentBookings(page)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading agent details...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Agent not found</p>
          <Button onClick={() => router.push('/agents')} className="mt-4">
            Back to Agents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/agents')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Details</h1>
          <p className="text-gray-600">{agent.reference_number}</p>
        </div>
      </div>

      {/* Agent Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              {getStatusBadge(agent.status)}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {agent.full_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {agent.phone_number}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {agent.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {agent.area_suburb ? `${agent.area_suburb}, ` : ''}{agent.city_town}, {agent.region}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">ID Type</p>
              <p className="font-medium">{agent.id_type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">ID Number</p>
              <p className="font-medium">{agent.id_number}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Mobile Money</p>
              <p className="font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {agent.mobile_money_provider}
              </p>
              <p className="text-sm text-gray-500">{agent.mobile_money_number}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Availability</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {agent.availability}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Applied Date</p>
              <p className="font-medium">{new Date(agent.created_at).toLocaleDateString()}</p>
            </div>

            {agent.approved_at && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Date</p>
                <p className="font-medium">{new Date(agent.approved_at).toLocaleDateString()}</p>
                {agent.approved_by_name && (
                  <p className="text-sm text-gray-500">by {agent.approved_by_name}</p>
                )}
              </div>
            )}

            {agent.rejection_reason && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{agent.rejection_reason}</p>
              </div>
            )}

            {agent.why_join && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Why Join?</p>
                <p className="text-sm">{agent.why_join}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                <p className="text-2xl font-bold text-blue-600">{Number(agent.commission_rate).toFixed(2)}%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-green-600">{agent.total_bookings}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-purple-600">GH₵ {Number(agent.total_earnings).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pending Commission</p>
                <p className="text-2xl font-bold text-orange-600">GH₵ {Number(agent.pending_commission || 0).toFixed(2)}</p>
              </div>
            </div>

            {agent.total_bookings > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average per Booking</p>
                <p className="text-lg font-semibold">
                  GH₵ {(Number(agent.total_earnings) / agent.total_bookings).toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                    <TableCell>{booking.client_name}</TableCell>
                    <TableCell>{booking.trip_route}</TableCell>
                    <TableCell>GH₵ {Number(booking.total_amount).toFixed(2)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      GH₵ {Number(booking.commission_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {bookingsTotalCount > 10 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((bookingsCurrentPage - 1) * 10) + 1} to {Math.min(bookingsCurrentPage * 10, bookingsTotalCount)} of {bookingsTotalCount} bookings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(bookingsCurrentPage - 1)}
                  disabled={bookingsCurrentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(bookingsCurrentPage + 1)}
                  disabled={bookingsCurrentPage * 10 >= bookingsTotalCount}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
