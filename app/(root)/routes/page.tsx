"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Trash2, Edit, MapPin } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { SearchFilter, ConfirmationModal } from "@/components/widgets/common"
import { routeService } from "@/services/routes"
import { Route } from "@/lib/types"
import RouteForm from "@/components/routes/route-form"

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
      } catch (err: any) {
        console.error("Error fetching routes:", err)
        if (showToast && loadingToast) {
          const errorMessage = err?.response?.data?.message ||
                              err?.response?.data?.error ||
                              err?.message ||
                              "Failed to load routes. Please try again."
          toast.error(errorMessage, {
            id: loadingToast,
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.id]
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
    } catch (error: any) {
      console.error("Failed to save route:", error)
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          error?.message ||
                          `Failed to ${isEditing ? "update" : "create"} route. Please try again.`
      toast.error(errorMessage)
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
    } catch (error: any) {
      console.error("Failed to delete route:", error)
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          error?.message ||
                          "Failed to delete route. Please try again."
      toast.error(errorMessage)
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeRoutes}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Routes</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalCount - activeRoutes}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalDistance.toFixed(0)} km
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-400" />
            </div>
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} routes
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
