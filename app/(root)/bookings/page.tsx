"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import {
  TicketCheck,
  Plus,
  MapPin,
  Calendar,
  Clock,
  User,
  CreditCard,
  MoreHorizontal,
  Eye,
  Download,
  X
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Loader } from "@/components/ui/loader"
import { SearchFilter, ConfirmationModal } from "@/components/widgets/common"
import { bookingService } from "@/services/booking"
import { Booking, BookingCreateData } from "@/lib/types"
import BookingForm from "@/components/bookings/booking-form"


export default function BookingsList() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
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

  const fetchBookings = useCallback(
    async (page: number, search?: string, status?: string, showToast: boolean = true) => {
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

        const response = await bookingService.getBookings(
          page,
          search || undefined,
          status || undefined
        )

        setBookings(response.results)
        setTotalItems(response.count)
        setTotalPages(Math.ceil(response.count / itemsPerPage))

        if (showToast && loadingToast) {
          if (search) {
            toast.success(
              `Found ${response.results.length} bookings matching "${search}"`,
              { id: loadingToast }
            )
          } else {
            toast.success(`Loaded ${response.results.length} bookings`, {
              id: loadingToast,
            })
          }
        }
      } catch (err) {
        console.error("Error fetching bookings:", err)
        if (showToast && loadingToast) {
          toast.error("Failed to load bookings. Please try again.", {
            id: loadingToast,
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage, session?.user?.id]
  )

  // Initial load only
  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      return
    }

    if (
      status === "authenticated" &&
      session?.user?.id &&
      bookings.length === 0
    ) {
      fetchBookings(1, "", "", false)
    }
  }, [status, session?.user?.id, bookings.length, fetchBookings])

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchBookings(page, searchTerm, statusFilter, false)
  }

  // Manual search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchBookings(1, searchTerm, statusFilter, true)
  }

  // Handle filter change
  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setCurrentPage(1)
    fetchBookings(1, searchTerm, newStatus, true)
  }

  // Reset search
  const handleReset = () => {
    setSearchTerm("")
    setStatusFilter("")
    setCurrentPage(1)

    toast.success("🔄 Search cleared - showing all bookings", {
      duration: 3000,
      style: {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    })

    fetchBookings(1, "", "", false)
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
      setBookings(prev => prev.filter(b => b.id !== cancelModal.booking!.id))
      setTotalItems(prev => prev - 1)
      toast.success(`Booking ${cancelModal.booking.reference_id} cancelled successfully`)
      setCancelModal({ isOpen: false, booking: null, isCancelling: false })
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast.error("Failed to cancel booking. Please try again.")
      setCancelModal(prev => ({ ...prev, isCancelling: false }))
    }
  }

  const handleCancelClose = () => {
    if (!cancelModal.isCancelling) {
      setCancelModal({ isOpen: false, booking: null, isCancelling: false })
    }
  }

  const handleFormSubmit = async (formData: BookingCreateData) => {
    setSubmitting(true)

    try {
      if (editingBooking) {
        const response = await bookingService.updateBooking(editingBooking.id, formData)
        if (response.success) {
          setBookings(prev => prev.map(booking =>
            booking.id === editingBooking.id ? response.booking : booking
          ))
          setEditingBooking(null)
          setShowCreateForm(false)
          toast.success("Booking updated successfully")
        }
      } else {
        const response = await bookingService.createBooking(formData)
        if (response.success) {
          setBookings(prev => [...prev, response.booking])
          setTotalItems(prev => prev + 1)
          setShowCreateForm(false)
          toast.success("Booking created successfully")
        }
      }
    } catch (error) {
      console.error("Failed to save booking:", error)
      toast.error("Failed to save booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
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
      case "confirmed": return "bg-green-100 text-green-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "cancelled": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems)

  const totalBookings = totalItems
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0
  const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_amount), 0) || 0

  const bookingStatuses = ["confirmed", "pending", "cancelled"]

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
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 justify-center">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Booking</span>
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
            <div className="text-2xl font-bold text-gray-900">GHS {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">
              From paid bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onReset={handleReset}
        placeholder="Search by booking ID, customer name, or route..."
        filterPosition="after"
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">All Status</option>
            {bookingStatuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        }
      />

      {/* Bookings List */}
      <Card>
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
              <div className="space-y-4">
                {bookings.map((booking) => (
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
                          <h3 className="font-semibold text-gray-900">{booking.reference_id}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status_display}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {booking.user_details.full_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.departure_terminal} → {booking.destination_terminal}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.travel_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.departure_time}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Seat: {booking.seat_number}</span>
                          <span>Bus: {booking.plate_number}</span>
                          <span>Route: {booking.route_name}</span>
                          <span>Booked: {new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          GHS {booking.total_amount}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.departure_time} - {booking.arrival_time}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {booking.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancel Booking"
                            onClick={() => handleCancelClick(booking)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit Booking"
                          onClick={() => startEdit(booking)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  showingStart={showingStart}
                  showingEnd={showingEnd}
                />
              </div>
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
        variant="danger"
        isLoading={cancelModal.isCancelling}
      />
    </div>
  )
}