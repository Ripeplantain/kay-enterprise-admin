"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Edit, Trash2, Settings } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { SearchFilter, ConfirmationModal } from "@/components/widgets/common"
import { busService } from "@/services"
import { Bus } from "@/lib/types"
import BusForm from "@/components/buses/bus-form"

interface BusFormData {
  plate_number: string
  bus_type: string
  total_seats: number
}

export default function BusesPage() {
  const { data: session } = useSession()
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    bus: Bus | null
    isDeleting: boolean
  }>({
    isOpen: false,
    bus: null,
    isDeleting: false
  })

  const fetchBuses = useCallback(
    async (page: number, search?: string, busType?: string, showToast: boolean = true) => {
      if (!session?.user?.id) {
        if (showToast)
          toast.error("Authentication required. Please log in again.");
        return;
      }

      let loadingToast: string | undefined;
      if (showToast) {
        loadingToast = toast.loading("Loading buses...");
      }

      try {
        setLoading(true);

        const response = await busService.getBuses(
          page,
          search || undefined,
          busType || undefined
        );

        setBuses(response.results);
        setTotalCount(response.count);

        if (showToast && loadingToast) {
          if (search) {
            toast.success(
              `Found ${response.results.length} buses matching "${search}"`,
              { id: loadingToast }
            );
          } else {
            toast.success(`Loaded ${response.results.length} buses`, {
              id: loadingToast,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching buses:", err);
        if (showToast && loadingToast) {
          toast.error("Failed to load buses. Please try again.", {
            id: loadingToast,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  // Initial load only
  useEffect(() => {
    if (session?.user?.id && buses.length === 0) {
      // Only load initially, no toast for initial load
      fetchBuses(1, "", "", false);
    }
  }, [session?.user?.id, buses.length, fetchBuses]);

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBuses(page, searchTerm, filterType, false); // No toast for page changes
  };

  // Manual search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchBuses(1, searchTerm, filterType, true); // Show toast for manual search
  };

  // Handle filter change
  const handleFilterChange = (newFilterType: string) => {
    setFilterType(newFilterType);
    setCurrentPage(1);
    fetchBuses(1, searchTerm, newFilterType, true); // Show toast for filter change
  };

  // Reset search
  const handleReset = () => {
    setSearchTerm("");
    setFilterType("");
    setCurrentPage(1);

    // Show a nice toast for clearing
    toast.success("🔄 Search cleared - showing all buses", {
      duration: 3000,
      style: {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    });

    fetchBuses(1, "", "", false); // No additional toast from fetchBuses
  };

  const handleFormSubmit = async (formData: BusFormData) => {
    setSubmitting(true)

    try {
      if (editingBus) {
        const response = await busService.updateBus(String(editingBus.id), formData)
        if (response.success) {
          setBuses(prev => prev.map(bus =>
            bus.id === editingBus.id ? response.bus : bus
          ))
          setEditingBus(null)
          setShowCreateForm(false)
        }
      } else {
        const response = await busService.createBus(formData)
        if (response.success) {
          setBuses(prev => [...prev, response.bus])
          setTotalCount(prev => prev + 1)
          setShowCreateForm(false)
        }
      }
    } catch (error) {
      console.error("Failed to save bus:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (bus: Bus) => {
    setDeleteModal({
      isOpen: true,
      bus,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.bus) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      await busService.deleteBus(deleteModal.bus.id.toString())
      setBuses(prev => prev.filter(b => b.id !== deleteModal.bus!.id))
      setTotalCount(prev => prev - 1)
      toast.success(`Bus ${deleteModal.bus.plate_number} deleted successfully`)
      setDeleteModal({ isOpen: false, bus: null, isDeleting: false })
    } catch (error) {
      console.error("Failed to delete bus:", error)
      toast.error("Failed to delete bus. Please try again.")
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, bus: null, isDeleting: false })
    }
  }

  const startEdit = (bus: Bus) => {
    setEditingBus(bus)
    setShowCreateForm(true)
  }

  const cancelForm = () => {
    setEditingBus(null)
    setShowCreateForm(false)
  }

  const busTypes = ["vip", "express"]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bus Management</h1>
          <p className="text-gray-600">Manage your fleet of buses</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Bus
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Buses</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Buses</p>
                <p className="text-2xl font-bold text-green-600">
                  {buses.length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Seats</p>
                <p className="text-2xl font-bold text-red-600">
                  {buses.reduce((acc, bus) => acc + bus.total_seats, 0)}
                </p>
              </div>
              <Settings className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Seats</p>
                <p className="text-2xl font-bold">
                  {buses.reduce((acc, bus) => acc + bus.seats.filter(s => s.is_available).length, 0)}
                </p>
              </div>
              <Settings className="w-8 h-8 text-blue-400" />
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
        placeholder="Search buses by plate number or type..."
        filterPosition="after"
        filterComponent={
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Bus Types</option>
            {busTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        }
      />

      {/* Create/Edit Form */}
      {showCreateForm && (
        <BusForm
          bus={editingBus}
          onSubmit={handleFormSubmit}
          onCancel={cancelForm}
          submitting={submitting}
        />
      )}

      {/* Buses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Buses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading buses...</div>
            </div>
          ) : buses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No buses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Available Seats</TableHead>
                  <TableHead>Bus ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.plate_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{bus.bus_type}</Badge>
                    </TableCell>
                    <TableCell>{bus.total_seats} seats</TableCell>
                    <TableCell>
                      <span className="text-lg font-semibold text-green-600">
                        {bus.seats.filter(s => s.is_available).length}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        / {bus.total_seats}
                      </span>
                    </TableCell>
                    <TableCell>Bus {bus.bus_id}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(bus)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(bus)}
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
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} buses
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
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
        title="Delete Bus"
        message={
          deleteModal.bus
            ? `Are you sure you want to delete bus "${deleteModal.bus.plate_number}"? This action cannot be undone.`
            : "Are you sure you want to delete this bus?"
        }
        confirmText="Delete Bus"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  )
}