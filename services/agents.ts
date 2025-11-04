import apiInstance from '@/lib/api'
import {
  Agent,
  AgentsResponse,
  AgentRegistrationData,
  AgentApprovalData,
  AgentRejectionData,
  AgentBookingsResponse,
  AgentStats
} from '@/lib/types'

export const agentService = {
  // Public registration
  registerAgent: async (data: AgentRegistrationData): Promise<{ success: boolean; message: string; data: { agent_id: number; reference_number: string } }> => {
    const response = await apiInstance.post('agents/register/', data)
    return response.data
  },

  // Admin: Get all agents
  getAgents: async (
    page: number = 1,
    search?: string,
    status?: 'pending' | 'approved' | 'rejected',
    region?: string
  ): Promise<AgentsResponse> => {
    let endpoint = `agents/manage/?page=${page}`
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`
    }
    if (status) {
      endpoint += `&status=${status}`
    }
    if (region) {
      endpoint += `&region=${encodeURIComponent(region)}`
    }
    const response = await apiInstance.get(endpoint)
    return response.data
  },

  // Admin: Get approved agents
  getApprovedAgents: async (page: number = 1): Promise<AgentsResponse> => {
    const response = await apiInstance.get(`agents/manage/approved/?page=${page}`)
    return response.data
  },

  // Admin: Get pending agents
  getPendingAgents: async (page: number = 1): Promise<AgentsResponse> => {
    const response = await apiInstance.get(`agents/manage/pending/?page=${page}`)
    return response.data
  },

  // Admin: Get agent details
  getAgent: async (id: string): Promise<Agent> => {
    const response = await apiInstance.get(`agents/manage/${id}/`)
    return response.data
  },

  // Admin: Approve agent
  approveAgent: async (id: string, data: AgentApprovalData): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiInstance.post(`agents/manage/${id}/approve/`, data)
    return response.data
  },

  // Admin: Reject agent
  rejectAgent: async (id: string, data: AgentRejectionData): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiInstance.post(`agents/manage/${id}/reject/`, data)
    return response.data
  },

  // Admin: Get agent bookings
  getAgentBookings: async (id: string, page: number = 1): Promise<AgentBookingsResponse> => {
    const response = await apiInstance.get(`agents/manage/${id}/bookings/?page=${page}`)
    return response.data
  },

  // Admin: Get overall stats
  getStats: async (): Promise<AgentStats> => {
    const response = await apiInstance.get('agents/manage/stats/')
    return response.data
  }
}
