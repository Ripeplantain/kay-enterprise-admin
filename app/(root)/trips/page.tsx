"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Trash2, Edit, Eye, Users } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { SearchFilter, ConfirmationModal } from "@/components/widgets/common"
import { tripService } from "@/services/trips"
import { routeService } from "@/services/routes"
import { busService } from "@/services/bus"
import { Trip, Route, Bus } from "@/lib/types"
import TripForm from "@/components/trips/trip-form"
import TripSeats from "@/components/trips/trip-seats"

interface TripFormData {
  route: number
  bus: number
  departure_datetime: string
  arrival_datetime: string
  price_per_seat: number
  available_seats: number
  status: 'scheduled' | 'boarding' | 'departed' | 'cancelled' | 'completed'
  pickup_points: { name: string; time: string }[]
  drop_points: { name: string; time: string }[]
}

export default function TripsPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterRoute, setFilterRoute] = useState("")
  const [filterOrigin, setFilterOrigin] = useState("")
  const [filterDestination, setFilterDestination] = useState("")
  const [filterDepartureDate, setFilterDepartureDate] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [viewingSeats, setViewingSeats] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    trip: Trip | null
    isDeleting: boolean
  }>({
    isOpen: false,
    trip: null,
    isDeleting: false
  })

  // Fetch routes and buses for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [routesRes, busesRes] = await Promise.all([
          routeService.getRoutes(1),
          busService.getBuses(1)
        ])
        setRoutes(routesRes.results)
        setBuses(busesRes.results)
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error)
      }
    }

    if (session?.user?.id) {
      fetchDropdownData()
    }
  }, [session?.user?.id])

  const fetchTrips = useCallback(
    async (page: number, showToast: boolean = true) => {
      if (!session?.user?.id) {
        if (showToast)
          toast.error("Authentication required. Please log in again.")
        return
      }

      let loadingToast: string | undefined
      if (showToast) {
        loadingToast = toast.loading("Loading trips...")
      }

      try {
        setLoading(true)

        const filters = {
          page,
          search: searchTerm || undefined,
          status: filterStatus || undefined,
          route: filterRoute || undefined,
          origin: filterOrigin || undefined,
          destination: filterDestination || undefined,
          departure_date: filterDepartureDate || undefined,
        }

        const response = await tripService.getTrips(filters)

        setTrips(response.results)
        setTotalCount(response.count)

        if (showToast && loadingToast) {
          if (searchTerm || filterStatus || filterRoute || filterDepartureDate) {
            toast.success(
              `Found ${response.results.length} trips`,
              { id: loadingToast }
            )
          } else {
            toast.success(`Loaded ${response.results.length} trips`, {
              id: loadingToast,
            })
          }
        }
      } catch (err: any) {
        console.error("Error fetching trips:", err)
        if (showToast && loadingToast) {
          const errorMessage = err?.response?.data?.message ||
                              err?.response?.data?.error ||
                              err?.message ||
                              "Failed to load trips. Please try again."
          toast.error(errorMessage, {
            id: loadingToast,
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.id, searchTerm, filterStatus, filterRoute, filterOrigin, filterDestination, filterDepartureDate]
  )

  // Initial load only
  useEffect(() => {
    if (session?.user?.id && trips.length === 0) {
      fetchTrips(1, false)
    }
  }, [session?.user?.id, trips.length, fetchTrips])

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTrips(page, false)
  }

  // Manual search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchTrips(1, true)
  }

  // Reset search
  const handleReset = () => {
    setSearchTerm("")
    setFilterStatus("")
    setFilterRoute("")
    setFilterOrigin("")
    setFilterDestination("")
    setFilterDepartureDate("")
    setCurrentPage(1)

    toast.success("🔄 Filters cleared - showing all trips", {
      duration: 3000,
      style: {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    })

    fetchTrips(1, false)
  }

  const handleFormSubmit = async (formData: TripFormData) => {
    setSubmitting(true)
    const isEditing = !!editingTrip

    try {
      if (isEditing) {
        await tripService.updateTrip(editingTrip.id.toString(), formData)
        toast.success(`Trip updated successfully`)
        setEditingTrip(null)
      } else {
        await tripService.createTrip(formData)
        toast.success(`Trip created successfully`)
        setShowCreateForm(false)
      }

      // Refresh the trips list
      await fetchTrips(currentPage, false)
    } catch (error: any) {
      console.error("Failed to save trip:", error)
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          error?.message ||
                          `Failed to ${isEditing ? "update" : "create"} trip. Please try again.`
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (trip: Trip) => {
    setEditingTrip(trip)
    setShowCreateForm(false)
  }

  const handleDeleteClick = (trip: Trip) => {
    setDeleteModal({
      isOpen: true,
      trip,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.trip) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      await tripService.deleteTrip(deleteModal.trip.id.toString())
      toast.success(`Trip deleted successfully`)
      setDeleteModal({ isOpen: false, trip: null, isDeleting: false })

      // Refresh the trips list
      await fetchTrips(currentPage, false)
    } catch (error: any) {
      console.error("Failed to delete trip:", error)
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          error?.message ||
                          "Failed to delete trip. Please try again."
      toast.error(errorMessage)
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, trip: null, isDeleting: false })
    }
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingTrip(null)
  }

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline"> = {
      scheduled: "outline",
      boarding: "default",
      departed: "default",
      cancelled: "destructive",
      completed: "outline"
    }
    return variants[status] || "outline"
  }

  const scheduledTrips = trips.filter(t => t.status === 'scheduled').length
  const activeTrips = trips.filter(t => ['boarding', 'in_transit'].includes(t.status)).length
  const completedTrips = trips.filter(t => t.status === 'completed').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-gray-600">Manage bus trips and schedules</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Trip
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {scheduledTrips}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeTrips}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {completedTrips}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <SearchFilter
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearch={handleSearch}
              onReset={handleReset}
              placeholder="Search trips..."
            />

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                    fetchTrips(1, true)
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="in_transit">In Transit</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Route</label>
                <select
                  value={filterRoute}
                  onChange={(e) => {
                    setFilterRoute(e.target.value)
                    setCurrentPage(1)
                    fetchTrips(1, true)
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All Routes</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Origin</label>
                <Input
                  type="text"
                  value={filterOrigin}
                  onChange={(e) => setFilterOrigin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1)
                      fetchTrips(1, true)
                    }
                  }}
                  placeholder="e.g., Accra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <Input
                  type="text"
                  value={filterDestination}
                  onChange={(e) => setFilterDestination(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1)
                      fetchTrips(1, true)
                    }
                  }}
                  placeholder="e.g., Kumasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Departure Date</label>
                <input
                  type="date"
                  value={filterDepartureDate}
                  onChange={(e) => {
                    setFilterDepartureDate(e.target.value)
                    setCurrentPage(1)
                    fetchTrips(1, true)
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingTrip) && (
        <TripForm
          onSubmit={handleFormSubmit}
          onCancel={cancelForm}
          submitting={submitting}
          initialData={editingTrip}
          mode={editingTrip ? "edit" : "create"}
          routes={routes}
          buses={buses}
        />
      )}

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading trips...</div>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No trips found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">#{trip.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{trip.route_name}</span>
                          <span className="text-xs text-gray-500">
                            {trip.origin} → {trip.destination}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{trip.bus_plate}</span>
                          <span className="text-xs text-gray-500 uppercase">
                            {trip.bus_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(trip.departure_datetime)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(trip.arrival_datetime)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${trip.price_per_seat}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          {trip.available_seats}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(trip.status)}>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingSeats(trip.id.toString())}
                            className="text-purple-600 hover:text-purple-800"
                            title="View Seats"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(trip)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(trip)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} trips
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip"
        message={
          deleteModal.trip
            ? `Are you sure you want to delete this trip? This action cannot be undone.`
            : "Are you sure you want to delete this trip?"
        }
        confirmText="Delete Trip"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />

      {/* Trip Seats Modal */}
      {viewingSeats && (
        <TripSeats
          tripId={viewingSeats}
          onClose={() => setViewingSeats(null)}
        />
      )}
    </div>
  )
}
