"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { useApiError } from "@/hooks/use-api-error"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import {
  TicketCheck,
  Plus,
  Calendar,
  Clock,
  User,
  CreditCard,
  Eye,
  Download,
  X,
  Trash2
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Loader } from "@/components/ui/loader"
import { SearchFilter, ConfirmationModal, DateRangeFilter } from "@/components/widgets/common"
import { bookingService } from "@/services/bookings"
import { Booking, BookingCreateData, BookingStats } from "@/lib/types"
import BookingForm from "@/components/bookings/booking-form"
import BookingDetailsModal from "@/components/bookings/booking-details-modal"

export default function BookingsList() {
  const { handleError } = useApiError()
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    booking: Booking | null
    isCancelling: boolean
  }>({
    isOpen: false,
    booking: null,
    isCancelling: false
  })

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean
    booking: Booking | null
  }>({
    isOpen: false,
    booking: null
  })



  const fetchBookings = useCallback(
    async (page: number, showToast: boolean = true) => {
      if (!session?.user?.id) {
        if (showToast)
          toast.error("Authentication required. Please log in again.")
        return
      }

      let loadingToast: string | undefined
      if (showToast) {
        loadingToast = toast.loading("Loading bookings...")
      }

      try {
        setLoading(true)

        const filters = {
          page,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }

        const response = await bookingService.getBookings(filters)

        setBookings(response.results)
        setTotalCount(response.count)

        if (showToast && loadingToast) {
          if (searchTerm || statusFilter) {
            toast.success(
              `Found ${response.results.length} bookings`,
              { id: loadingToast }
            )
          } else {
            toast.success(`Loaded ${response.results.length} bookings`, {
              id: loadingToast,
            })
          }
        }
      } catch (err: any) {
        if (loadingToast) {
          toast.dismiss(loadingToast)
        }
        handleError(err, "Failed to load bookings. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.id, searchTerm, statusFilter, startDate, endDate, handleError]
  )

  const fetchBookingStats = useCallback(async () => {
    if (!session?.user?.id) {
      return
    }
    try {
      const filters = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }
      const statsData = await bookingService.getBookingStats(filters)
      setStats(statsData)
    } catch (error) {
      handleError(error, "Failed to load booking statistics.")
    }
  }, [session?.user?.id, startDate, endDate, handleError])

  // Initial load and reset
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") return

    if (status === "authenticated" && session?.user?.id) {
      if (searchTerm === "" && statusFilter === "" && startDate === "" && endDate === "") {
        fetchBookings(1, false)
        fetchBookingStats()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id, searchTerm, statusFilter, startDate, endDate])

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchBookings(page, false)
  }

  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1)
    fetchBookings(1, true)
    fetchBookingStats()
  }, [fetchBookings, fetchBookingStats])

  useEffect(() => {
    if (statusFilter) {
      handleApplyFilters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);




  // Reset search
  const handleReset = () => {
    setSearchTerm("")
    setStatusFilter("")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  const handleFormSubmit = async (formData: BookingCreateData) => {
    setSubmitting(true)
    const isEditing = !!editingBooking

    try {
      if (isEditing) {
        await bookingService.updateBooking(editingBooking.id, formData)
        toast.success("Booking updated successfully")
        setEditingBooking(null)
      } else {
        await bookingService.createBooking(formData)
        toast.success("Booking created successfully")
      }

      setShowCreateForm(false)
      // Refresh the bookings list
      await fetchBookings(currentPage, false)
    } catch (error) {
      handleError(error, `Failed to ${isEditing ? "update" : "create"} booking. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = (booking: Booking) => {
    setCancelModal({
      isOpen: true,
      booking,
      isCancelling: false
    })
  }

  const handleCancelConfirm = async () => {
    if (!cancelModal.booking) return

    setCancelModal(prev => ({ ...prev, isCancelling: true }))

    try {
      await bookingService.cancelBooking(cancelModal.booking.id)
      toast.success(`Booking ${cancelModal.booking.reference_id} cancelled successfully`)
      setCancelModal({ isOpen: false, booking: null, isCancelling: false })

      // Refresh the bookings list
      await fetchBookings(currentPage, false)
    } catch (error) {
      handleError(error, "Failed to cancel booking. Please try again.")
      setCancelModal(prev => ({ ...prev, isCancelling: false }))
    }
  }

  const handleCancelClose = () => {
    if (!cancelModal.isCancelling) {
      setCancelModal({ isOpen: false, booking: null, isCancelling: false })
    }
  }

  const handleViewDetailsClick = (booking: Booking) => {
    setDetailsModal({
      isOpen: true,
      booking
    })
  }

  const handleDetailsClose = () => {
    setDetailsModal({ isOpen: false, booking: null })
  }



  const startEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setShowCreateForm(true)
  }

  const cancelForm = () => {
    setEditingBooking(null)
    setShowCreateForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default"
      case "pending": return "outline"
      case "cancelled": return "destructive"
      default: return "outline"
    }
  }

  const bookingStatuses = ["confirmed", "pending", "cancelled", "completed"]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Manage customer bookings and reservations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="flex items-center gap-2 justify-center">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bookings
            </CardTitle>
            <TicketCheck className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_bookings ?? '...'}</div>
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
            <div className="text-2xl font-bold text-gray-900">{stats?.confirmed_bookings ?? '...'}</div>
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
            <div className="text-2xl font-bold text-gray-900">{stats?.pending_bookings ?? '...'}</div>
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
            <div className="text-2xl font-bold text-gray-900">GHS {stats?.total_revenue?.toFixed(2) ?? '...'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={handleApplyFilters}
          onReset={handleReset}
          placeholder="Search by booking ID, customer name, or route..."
        />
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={handleApplyFilters}
            onClear={handleReset}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background h-10"
          >
            <option value="">All Status</option>
            {bookingStatuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader message="Loading bookings..." />
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={TicketCheck}
              title={searchTerm ? "No bookings found" : "No bookings yet"}
              description={
                searchTerm
                  ? `No bookings match "${searchTerm}". Try adjusting your search terms.`
                  : "Bookings will appear here once customers start making reservations."
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Travel Date</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {booking.agent_name || booking.user_details?.full_name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.trip_details.route_name}</span>
                          <span className="text-xs text-gray-500">
                            {booking.trip_details.origin} → {booking.trip_details.destination}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(booking.trip_details.departure_datetime).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{booking.seat_number}</TableCell>
                      <TableCell className="font-semibold">GHS {booking.total_amount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" title="View Details" onClick={() => handleViewDetailsClick(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Cancel Booking"
                              onClick={() => handleCancelClick(booking)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalCount > 10 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} bookings
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage * 10 >= totalCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <BookingForm
          booking={editingBooking}
          onSubmit={handleFormSubmit}
          onCancel={cancelForm}
          submitting={submitting}
        />
      )}

      <BookingDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={handleDetailsClose}
        booking={detailsModal.booking}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Booking"
        message={
          cancelModal.booking
            ? `Are you sure you want to cancel booking "${cancelModal.booking.reference_id}"? This action cannot be undone and may affect the customer's travel plans.`
            : "Are you sure you want to cancel this booking?"
        }
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        variant="warning"
        isLoading={cancelModal.isCancelling}
      />


    </div>
  )
}
