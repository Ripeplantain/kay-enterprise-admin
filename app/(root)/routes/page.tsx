"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Trash2, Edit, MapPin } from "lucide-react"
import toast from "react-hot-toast"
import { useApiError } from "@/hooks/use-api-error"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { routeService } from "@/services/routes"
import { Route } from "@/lib/types"
import RouteForm from "@/components/routes/route-form"
import { ConfirmationModal } from "@/components/widgets/common/confirmation-modal"
import { SearchFilter } from "@/components/widgets/common/search-filter"

interface RouteFormData {
  name: string
  origin: string
  destination: string
  distance_km: number
  estimated_duration_hours: number
  is_active: boolean
}

export default function RoutesPage() {
  const { data: session } = useSession()
  const { handleError } = useApiError()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    route: Route | null
    isDeleting: boolean
  }>({
    isOpen: false,
    route: null,
    isDeleting: false
  })

  const fetchRoutes = useCallback(
    async (page: number, search?: string, showToast: boolean = true) => {
      if (!session?.user?.id) {
        if (showToast)
          toast.error("Authentication required. Please log in again.")
        return
      }

      let loadingToast: string | undefined
      if (showToast) {
        loadingToast = toast.loading("Loading routes...")
      }

      try {
        setLoading(true)

        const response = await routeService.getRoutes(
          page,
          search || undefined
        )

        setRoutes(response.results)
        setTotalCount(response.count)

        if (showToast && loadingToast) {
          if (search) {
            toast.success(
              `Found ${response.results.length} routes matching "${search}"`,
              { id: loadingToast }
            )
          } else {
            toast.success(`Loaded ${response.results.length} routes`, {
              id: loadingToast,
            })
          }
        }
      } catch (err) {
        console.error("Error fetching routes:", err)
        if (showToast && loadingToast) {
          toast.dismiss(loadingToast)
        }
        if (showToast) {
          handleError(err, "Failed to load routes. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.id, handleError]
  )

  // Initial load only
  useEffect(() => {
    if (session?.user?.id && routes.length === 0) {
      fetchRoutes(1, "", false)
    }
  }, [session?.user?.id, routes.length, fetchRoutes])

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchRoutes(page, searchTerm, false)
  }

  // Manual search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchRoutes(1, searchTerm, true)
  }

  // Reset search
  const handleReset = () => {
    setSearchTerm("")
    setCurrentPage(1)

    toast.success("🔄 Search cleared - showing all routes", {
      duration: 3000,
      style: {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    })

    fetchRoutes(1, "", false)
  }

  const handleFormSubmit = async (formData: RouteFormData) => {
    setSubmitting(true)
    const isEditing = !!editingRoute

    try {
      if (isEditing) {
        await routeService.updateRoute(editingRoute.id.toString(), formData)
        toast.success(`Route "${formData.name}" updated successfully`)
        setEditingRoute(null)
      } else {
        await routeService.createRoute(formData)
        toast.success(`Route "${formData.name}" created successfully`)
        setShowCreateForm(false)
      }

      // Refresh the routes list
      await fetchRoutes(currentPage, searchTerm, false)
    } catch (error) {
      console.error("Failed to save route:", error)
      handleError(error, `Failed to ${isEditing ? "update" : "create"} route. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (route: Route) => {
    setEditingRoute(route)
    setShowCreateForm(false)
  }

  const handleDeleteClick = (route: Route) => {
    setDeleteModal({
      isOpen: true,
      route,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.route) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))
    const routeName = deleteModal.route.name

    try {
      await routeService.deleteRoute(deleteModal.route.id.toString())
      toast.success(`Route "${routeName}" deleted successfully`)
      setDeleteModal({ isOpen: false, route: null, isDeleting: false })

      // Refresh the routes list
      await fetchRoutes(currentPage, searchTerm, false)
    } catch (error) {
      console.error("Failed to delete route:", error)
      handleError(error, "Failed to delete route. Please try again.")
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, route: null, isDeleting: false })
    }
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingRoute(null)
  }

  const activeRoutes = routes.filter(r => r.is_active).length
  const totalDistance = routes.reduce((acc, route) => acc + (Number(route.distance_km) || 0), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Route Management</h1>
          <p className="text-gray-600">Manage your bus routes and destinations</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Route
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Routes
            </CardTitle>
            <MapPin className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalCount}
            </div>
            <p className="text-xs text-green-600 mt-1">
              +3 new routes this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Routes
            </CardTitle>
            <MapPin className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {activeRoutes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCount > 0 ? Math.round((activeRoutes / totalCount) * 100) : 0}%
              of total routes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inactive Routes
            </CardTitle>
            <MapPin className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalCount - activeRoutes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCount > 0
                ? Math.round(((totalCount - activeRoutes) / totalCount) * 100)
                : 0}
              % of total routes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Distance
            </CardTitle>
            <MapPin className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalDistance.toFixed(0)} km
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all routes
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
        placeholder="Search routes by name, origin, or destination..."
      />

      {/* Create/Edit Form */}
      {(showCreateForm || editingRoute) && (
        <RouteForm
          onSubmit={handleFormSubmit}
          onCancel={cancelForm}
          submitting={submitting}
          initialData={editingRoute}
          mode={editingRoute ? "edit" : "create"}
        />
      )}

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading routes...</div>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No routes found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">#{route.id}</TableCell>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>{route.origin}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{route.distance_km} km</TableCell>
                    <TableCell>{route.estimated_duration_hours} hrs</TableCell>
                    <TableCell>
                      <Badge variant={route.is_active ? "default" : "destructive"}>
                        {route.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(route)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(route)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / 10)}
          totalItems={totalCount}
          itemsPerPage={10}
          onPageChange={handlePageChange}
          showingStart={(currentPage - 1) * 10 + 1}
          showingEnd={Math.min(currentPage * 10, totalCount)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Route"
        message={
          deleteModal.route
            ? `Are you sure you want to delete route "${deleteModal.route.name}" (${deleteModal.route.origin} → ${deleteModal.route.destination})? This action cannot be undone.`
            : "Are you sure you want to delete this route?"
        }
        confirmText="Delete Route"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  )
}
