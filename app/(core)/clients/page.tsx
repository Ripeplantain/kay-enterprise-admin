"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  MoreHorizontal,
  RotateCcw
} from "lucide-react"
import { apiClient, type Client, type StatsResponse } from "@/lib/api"
import { EmptyState } from "@/components/ui/empty-state"
import { Loader } from "@/components/ui/loader"

export default function ClientsList() {
  const { data: session, status } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [stats, setStats] = useState<StatsResponse['stats'] | null>(null)
  

  const fetchStats = useCallback(async () => {
    if (!session?.accessToken) return

    try {
      apiClient.setToken(session.accessToken)
      const response = await apiClient.getStats()
      setStats(response.stats)
    } catch (err) {
      console.error("Error fetching stats:", err)
      // Don't show error toast for stats, it's not critical
    }
  }, [session?.accessToken])

  const fetchClients = useCallback(async (page: number, search?: string, showToast: boolean = true) => {
    // Check if we have a session and token
    if (!session?.accessToken) {
      if (showToast) toast.error("Authentication required. Please log in again.")
      return
    }

    let loadingToast: string | undefined
    if (showToast) {
      loadingToast = toast.loading("Loading clients...")
    }
    
    try {
      setLoading(true)
      
      // Set the access token before making the API call
      apiClient.setToken(session.accessToken)
      
      const response = await apiClient.getClients(page, search)
      
      setClients(response.results.clients)
      setTotalItems(response.results.total_count)
      setTotalPages(Math.ceil(response.results.total_count / itemsPerPage))
      
      if (showToast && loadingToast) {
        if (search) {
          toast.success(`Found ${response.results.clients.length} clients matching "${search}"`, { id: loadingToast })
        } else {
          toast.success(`Loaded ${response.results.clients.length} clients`, { id: loadingToast })
        }
      }
    } catch (err) {
      console.error("Error fetching clients:", err)
      if (showToast && loadingToast) {
        toast.error("Failed to load clients. Please try again.", { id: loadingToast })
      }
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage, session?.accessToken])

  // Initial load only - no automatic search on type
  useEffect(() => {
    if (status === "loading") {
      return // Wait for session to load
    }
    
    if (status === "unauthenticated") {
      return // Don't show toast, let the auth system handle redirects
    }
    
    if (status === "authenticated" && session?.accessToken && clients.length === 0) {
      // Only load initially, no toast for initial load
      fetchClients(1, "", false)
      fetchStats() // Also fetch stats
    }
  }, [status, session?.accessToken, clients.length, fetchClients, fetchStats])

  // Page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchClients(page, searchTerm, false) // No toast for page changes
  }

  // Manual search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchClients(1, searchTerm, true) // Show toast for manual search
  }

  // Reset search
  const handleReset = () => {
    setSearchTerm("")
    setCurrentPage(1)
    
    // Show a nice toast for clearing
    toast.success("🔄 Search cleared - showing all clients", { 
      duration: 3000,
      style: {
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db'
      }
    })
    
    fetchClients(1, "", false) // No additional toast from fetchClients
  }

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems)

  // Use real stats from API or fallback to calculated values
  const totalClientsCount = stats?.clients?.total ?? totalItems
  const activeClientsCount = stats?.clients?.active ?? clients.filter(c => c.is_active).length  
  const verifiedClientsCount = stats?.clients?.verified ?? clients.filter(c => c.is_verified).length
  const totalBookingsCount = stats?.bookings?.total ?? clients.reduce((sum, client) => sum + client.booking_count, 0)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer base and client information.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Clients
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalClientsCount}</div>
            <p className="text-xs text-green-600 mt-1">
              {stats?.activity?.new_clients ? `+${stats.activity.new_clients} new this month` : '+12% from last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Clients
            </CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeClientsCount}</div>
            <p className="text-xs text-blue-600 mt-1">
              {totalClientsCount > 0 ? Math.round((activeClientsCount/totalClientsCount) * 100) : 0}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Verified
            </CardTitle>
            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{verifiedClientsCount}</div>
            <p className="text-xs text-green-600 mt-1">
              {totalClientsCount > 0 ? Math.round((verifiedClientsCount/totalClientsCount) * 100) : 0}% verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bookings
            </CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalBookingsCount}</div>
            <p className="text-xs text-green-600 mt-1">
              {totalClientsCount > 0 ? Math.round(totalBookingsCount/totalClientsCount) : 0} avg per client
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search clients by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!searchTerm}
              title={searchTerm ? "Clear search and show all clients" : "No search to clear"}
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader message="Loading clients..." />
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm ? "No clients found" : "No clients yet"}
              description={
                searchTerm 
                  ? `No clients match "${searchTerm}". Try adjusting your search terms.`
                  : "Get started by adding your first client to the system."
              }
              action={
                !searchTerm 
                  ? {
                      label: "Add New Client",
                      onClick: () => console.log("Add client clicked")
                    }
                  : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{client.full_name}</div>
                            <div className="text-sm text-gray-500">{client.gender === 'M' ? 'Male' : 'Female'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {client.masked_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <div>
                            <div>{client.city_town}</div>
                            <div className="text-xs text-gray-500">{client.region_display}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={client.is_active ? "default" : "secondary"}
                            className={client.is_active ? "bg-green-100 text-green-700" : ""}
                          >
                            {client.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {client.is_verified && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.booking_count}</div>
                          {client.total_bookings_amount && (
                            <div className="text-sm text-gray-500">
                              ${client.total_bookings_amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(client.date_joined).toLocaleDateString()}
                        </div>
                        {client.last_login && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(client.last_login).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
    </div>
  )
}