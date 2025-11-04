"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Trash2, Package } from "lucide-react"
import toast from "react-hot-toast"
import { useApiError } from "@/hooks/use-api-error"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { SearchFilter, ConfirmationModal } from "@/components/widgets/common"
import { Pagination } from "@/components/ui/pagination"
import { luggageService } from "@/services"
import { LuggageType, LuggageTypeCreateData } from "@/lib/types"
import LuggageForm from "@/components/luggage/luggage-form"

export default function LuggagePage() {
  const { data: session } = useSession()
  const { handleError } = useApiError()
  const [luggageTypes, setLuggageTypes] = useState<LuggageType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    luggageType: LuggageType | null
    isDeleting: boolean
  }>({
    isOpen: false,
    luggageType: null,
    isDeleting: false
  })

  const fetchLuggageTypes = useCallback(
    async (page: number, search?: string, showToast: boolean = true) => {
      if (!session?.user?.id) {
        if (showToast)
          toast.error("Authentication required. Please log in again.");
        return;
      }

      let loadingToast: string | undefined;
      if (showToast) {
        loadingToast = toast.loading("Loading luggage types...");
      }

      try {
        setLoading(true);

        const response = await luggageService.getLuggageTypes(
          page,
          search || undefined,
          undefined
        );

        setLuggageTypes(response.results);
        setTotalCount(response.count);

        if (showToast && loadingToast) {
          if (search) {
            toast.success(
              `Found ${response.results.length} luggage types matching "${search}"`,
              { id: loadingToast }
            );
          } else {
            toast.success(`Loaded ${response.results.length} luggage types`, {
              id: loadingToast,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching luggage types:", err);
        if (showToast && loadingToast) {
          toast.dismiss(loadingToast);
        }
        if (showToast) {
          handleError(err, "Failed to load luggage types. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, handleError]
  );

  // Initial load only
  useEffect(() => {
    if (session?.user?.id && luggageTypes.length === 0) {
      fetchLuggageTypes(1, "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, luggageTypes.length]);

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLuggageTypes(page, searchTerm, false);
  };

  // Manual search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLuggageTypes(1, searchTerm, true);
  };

  // Reset search
  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);

    toast.success("🔄 Search cleared - showing all luggage types", {
      duration: 3000,
      style: {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    });

    fetchLuggageTypes(1, "", false);
  };

  const handleFormSubmit = async (formData: LuggageTypeCreateData) => {
    setSubmitting(true)

    try {
      const response = await luggageService.createLuggageType(formData)
      if (response) {
        toast.success("Luggage type created successfully")
        setShowCreateForm(false)
        await fetchLuggageTypes(currentPage, searchTerm, false)
      }
    } catch (error) {
      console.error("Failed to save luggage type:", error)
      handleError(error, "Failed to create luggage type. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (luggageType: LuggageType) => {
    setDeleteModal({
      isOpen: true,
      luggageType,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.luggageType) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      await luggageService.deleteLuggageType(deleteModal.luggageType.id.toString())
      toast.success(`Luggage type "${deleteModal.luggageType.name}" deleted successfully`)
      setDeleteModal({ isOpen: false, luggageType: null, isDeleting: false })
      await fetchLuggageTypes(currentPage, searchTerm, false)
    } catch (error) {
      console.error("Failed to delete luggage type:", error)
      handleError(error, "Failed to delete luggage type. Please try again.")
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, luggageType: null, isDeleting: false })
    }
  }

  const cancelForm = () => {
    setShowCreateForm(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Luggage Management</h1>
          <p className="text-gray-600">Manage luggage types and pricing</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Luggage Type
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Luggage Types
            </CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalCount}
            </div>
            <p className="text-xs text-green-600 mt-1">
              +2 new this month
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
        placeholder="Search luggage types by name..."
      />

      {/* Create Form */}
      {showCreateForm && (
        <LuggageForm
          onSubmit={handleFormSubmit}
          onCancel={cancelForm}
          submitting={submitting}
        />
      )}

      {/* Luggage Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Luggage Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading luggage types...</div>
            </div>
          ) : luggageTypes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No luggage types found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Max Weight (kg)</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {luggageTypes.map((luggageType) => (
                  <TableRow key={luggageType.id}>
                    <TableCell className="font-medium">{luggageType.name}</TableCell>
                    <TableCell>{Number(luggageType.max_weight_kg).toFixed(2)} kg</TableCell>
                    <TableCell>GH₵ {Number(luggageType.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(luggageType)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
        title="Delete Luggage Type"
        message={
          deleteModal.luggageType
            ? `Are you sure you want to delete luggage type "${deleteModal.luggageType.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this luggage type?"
        }
        confirmText="Delete Luggage Type"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  )
}
