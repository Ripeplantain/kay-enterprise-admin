"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Eye, CheckCircle, XCircle, Users } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useApiError } from "@/hooks/use-api-error"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { SearchFilter, ConfirmationModal } from "@/components/widgets/common"
import { Pagination } from "@/components/ui/pagination"
import { agentService } from "@/services"
import { Agent } from "@/lib/types"
import ApprovalModal from "@/components/agents/approval-modal"
import RejectionModal from "@/components/agents/rejection-modal"

export default function AgentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { handleError } = useApiError()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean
    agent: Agent | null
    isLoading: boolean
  }>({
    isOpen: false,
    agent: null,
    isLoading: false
  })

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean
    agent: Agent | null
    isLoading: boolean
  }>({
    isOpen: false,
    agent: null,
    isLoading: false
  })

  const fetchAgents = useCallback(
    async (page: number, search?: string, status?: string, showToast: boolean = true) => {
      if (!session?.user?.id) {
        if (showToast)
          toast.error("Authentication required. Please log in again.");
        return;
      }

      let loadingToast: string | undefined;
      if (showToast) {
        loadingToast = toast.loading("Loading agents...");
      }

      try {
        setLoading(true);

        const statusFilter = status as 'pending' | 'approved' | 'rejected' | undefined

        const response = await agentService.getAgents(
          page,
          search || undefined,
          statusFilter,
          undefined
        );

        setAgents(response.results);
        setTotalCount(response.count);

        if (showToast && loadingToast) {
          toast.success(`Loaded ${response.results.length} agents`, {
            id: loadingToast,
          });
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
        if (showToast && loadingToast) {
          toast.dismiss(loadingToast);
        }
        if (showToast) {
          handleError(err, "Failed to load agents. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, handleError]
  );

  useEffect(() => {
    if (session?.user?.id && agents.length === 0) {
      fetchAgents(1, "", "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, agents.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAgents(page, searchTerm, filterStatus, false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAgents(1, searchTerm, filterStatus, true);
  };

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
    fetchAgents(1, searchTerm, newStatus, true);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("");
    setCurrentPage(1);
    toast.success("🔄 Search cleared - showing all agents");
    fetchAgents(1, "", "", false);
  };

  const handleApproveClick = (agent: Agent) => {
    setApprovalModal({
      isOpen: true,
      agent,
      isLoading: false
    })
  }

  const handleApproveConfirm = async (commissionRate: number) => {
    if (!approvalModal.agent) return

    setApprovalModal(prev => ({ ...prev, isLoading: true }))

    try {
      await agentService.approveAgent(approvalModal.agent.id.toString(), { commission_rate: commissionRate })
      toast.success(`Agent "${approvalModal.agent.full_name}" approved successfully`)
      setApprovalModal({ isOpen: false, agent: null, isLoading: false })
      await fetchAgents(currentPage, searchTerm, filterStatus, false)
    } catch (error) {
      console.error("Failed to approve agent:", error)
      handleError(error, "Failed to approve agent. Please try again.")
      setApprovalModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleRejectClick = (agent: Agent) => {
    setRejectionModal({
      isOpen: true,
      agent,
      isLoading: false
    })
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectionModal.agent) return

    setRejectionModal(prev => ({ ...prev, isLoading: true }))

    try {
      await agentService.rejectAgent(rejectionModal.agent.id.toString(), { rejection_reason: reason })
      toast.success(`Agent "${rejectionModal.agent.full_name}" rejected`)
      setRejectionModal({ isOpen: false, agent: null, isLoading: false })
      await fetchAgents(currentPage, searchTerm, filterStatus, false)
    } catch (error) {
      console.error("Failed to reject agent:", error)
      handleError(error, "Failed to reject agent. Please try again.")
      setRejectionModal(prev => ({ ...prev, isLoading: false }))
    }
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

  const pendingCount = agents.filter(a => a.status === 'pending').length
  const approvedCount = agents.filter(a => a.status === 'approved').length
  const rejectedCount = agents.filter(a => a.status === 'rejected').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600">Manage and approve agents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Agents
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalCount}
            </div>
            <p className="text-xs text-green-600 mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Users className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {pendingCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0}%
              of total agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {approvedCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}%
              of total agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rejected
            </CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {rejectedCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCount > 0 ? Math.round((rejectedCount / totalCount) * 100) : 0}%
              of total agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onReset={handleReset}
        placeholder="Search agents by name, phone, or email..."
        filterPosition="after"
        filterComponent={
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading agents...</div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No agents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.reference_number}</TableCell>
                    <TableCell>{agent.full_name}</TableCell>
                    <TableCell>{agent.phone_number}</TableCell>
                    <TableCell>{agent.region}</TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>{agent.total_bookings}</TableCell>
                    <TableCell>GH₵ {Number(agent.total_earnings).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/agents/${agent.id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {agent.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveClick(agent)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectClick(agent)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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

      {/* Approval Modal */}
      {approvalModal.agent && (
        <ApprovalModal
          isOpen={approvalModal.isOpen}
          onClose={() => setApprovalModal({ isOpen: false, agent: null, isLoading: false })}
          onConfirm={handleApproveConfirm}
          agentName={approvalModal.agent.full_name}
          agentReference={approvalModal.agent.reference_number}
          isLoading={approvalModal.isLoading}
        />
      )}

      {/* Rejection Modal */}
      {rejectionModal.agent && (
        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={() => setRejectionModal({ isOpen: false, agent: null, isLoading: false })}
          onConfirm={handleRejectConfirm}
          agentName={rejectionModal.agent.full_name}
          agentReference={rejectionModal.agent.reference_number}
          isLoading={rejectionModal.isLoading}
        />
      )}
    </div>
  )
}
