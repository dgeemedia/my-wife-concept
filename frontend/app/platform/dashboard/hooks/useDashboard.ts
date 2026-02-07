// frontend/app/platform/dashboard/hooks/useDashboard.ts
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  OnboardingRequest, 
  DashboardBusiness, 
  DashboardStats,
  ActiveTab,
  CreateBusinessFromRequestData,
  BusinessStatusUpdate,
  RequestFilters
} from '../types'

export const useDashboard = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([])
  const [requests, setRequests] = useState<OnboardingRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({})
  const [filters, setFilters] = useState<RequestFilters>({})

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      
      if (!response.ok) {
        router.push('/platform/login')
        return
      }

      const data = await response.json()
      
      if (data.user.role !== 'super-admin') {
        toast.error('Access denied')
        router.push('/')
        return
      }

      setUser(data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/platform/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        const businessesWithCounts: DashboardBusiness[] = data.map((business: any) => ({
          ...business,
          _count: business._count || {
            users: 0,
            products: 0,
            orders: 0
          }
        }))
        setBusinesses(businessesWithCounts)
        
        // Update stats
        updateDashboardStats(businessesWithCounts, requests)
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      toast.error('Failed to load businesses')
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/onboarding/requests', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        const requestsWithComputed: OnboardingRequest[] = data.map((request: any) => ({
          ...request,
          daysSinceCreation: calculateDaysSinceCreation(request.createdAt),
          formattedCreatedAt: formatDate(request.createdAt),
          isRecent: isRecentRequest(request.createdAt)
        }))
        setRequests(requestsWithComputed)
        updateDashboardStats(businesses, requestsWithComputed)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      toast.error('Failed to load requests')
    }
  }

  const calculateDaysSinceCreation = (createdAt: string): number => {
    const createdDate = new Date(createdAt)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - createdDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isRecentRequest = (createdAt: string): boolean => {
    const days = calculateDaysSinceCreation(createdAt)
    return days <= 7
  }

  const updateDashboardStats = (
    businessesList: DashboardBusiness[], 
    requestsList: OnboardingRequest[]
  ) => {
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    
    const totalBusinesses = businessesList.length
    const activeBusinesses = businessesList.filter(b => b.isActive).length
    const suspendedBusinesses = businessesList.filter(b => !b.isActive).length
    
    // Calculate subscription statistics
    const subscribedBusinesses = businessesList.filter(b => {
      if (!b.subscriptionExpiry) return false
      const expiry = new Date(b.subscriptionExpiry)
      return expiry > today
    }).length
    
    const expiringSoon = businessesList.filter(b => {
      if (!b.subscriptionExpiry) return false
      const expiry = new Date(b.subscriptionExpiry)
      return expiry > today && expiry <= thirtyDaysFromNow
    }).length
    
    const expiredSubscriptions = businessesList.filter(b => {
      if (!b.subscriptionExpiry) return false
      const expiry = new Date(b.subscriptionExpiry)
      return expiry < today
    }).length
    
    const totalUsers = businessesList.reduce((sum, b) => sum + (b._count?.users || 0), 0)
    const totalProducts = businessesList.reduce((sum, b) => sum + (b._count?.products || 0), 0)
    const totalOrders = businessesList.reduce((sum, b) => sum + (b._count?.orders || 0), 0)
    const pendingRequests = requestsList.filter(r => r.status === 'pending').length
    const approvedRequests = requestsList.filter(r => r.status === 'approved').length
    const rejectedRequests = requestsList.filter(r => r.status === 'rejected').length

    const stats: DashboardStats = {
      totalBusinesses,
      activeBusinesses,
      suspendedBusinesses,
      subscribedBusinesses,
      expiringSoon,
      expiredSubscriptions,
      totalUsers,
      totalProducts,
      totalOrders,
      pendingRequests,
      approvedRequests,
      rejectedRequests
    }

    setDashboardStats(stats)
  }

  const handleToggleBusinessStatus = async (businessId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'suspend' : 'reactivate'
    let reason = ''
    
    if (currentStatus) {
      reason = prompt('Please provide a reason for suspension:') || ''
      if (!reason) {
        toast.error('Suspension reason is required')
        return
      }
    }

    const updateData: BusinessStatusUpdate = {
      businessId,
      isActive: !currentStatus,
      suspensionReason: reason || undefined
    }

    try {
      const response = await fetch(`/api/business/${businessId}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast.success(`Business ${action}d successfully`)
        fetchBusinesses()
      } else {
        throw new Error(`Failed to ${action} business`)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleApproveRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/onboarding/requests/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Request approved')
        fetchRequests()
      }
    } catch (error) {
      toast.error('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    const reason = prompt('Please provide a rejection reason:')
    if (!reason) return

    try {
      const response = await fetch(`/api/onboarding/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rejectionReason: reason })
      })

      if (response.ok) {
        toast.success('Request rejected')
        fetchRequests()
      }
    } catch (error) {
      toast.error('Failed to reject request')
    }
  }

  const handleApproveAndCreate = async (request: OnboardingRequest) => {
    setSelectedRequest(request)
    setShowCreateModal(true)
  }

  // This function is called when the admin confirms creation in the modal
  const handleCreateBusiness = async () => {
    if (!selectedRequest) return

    const createData: CreateBusinessFromRequestData = {
      requestId: selectedRequest.id,
      businessName: selectedRequest.businessName,
      businessType: selectedRequest.businessType,
      ownerEmail: selectedRequest.ownerEmail,
      ownerName: selectedRequest.ownerName,        
      ownerPhone: selectedRequest.ownerPhone,
      preferredSlug: selectedRequest.preferredSlug,
      sendWelcomeEmail: true
    }

    try {
      const response = await fetch('/api/business/create-from-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createData)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Business created successfully')
        setShowCreateModal(false)
        setSelectedRequest(null)
        fetchRequests()
        fetchBusinesses()
        setActiveTab('businesses')
      } else {
        throw new Error('Failed to create business')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/platform/login')
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const filteredBusinesses = businesses.filter(b =>
    b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const expiringSubscriptionsCount = businesses.filter(b => {
    if (!b.subscriptionExpiry) return false
    const expiry = new Date(b.subscriptionExpiry)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return expiry > today && expiry <= thirtyDaysFromNow
  }).length

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchBusinesses()
      fetchRequests()
    }
  }, [user])

  return {
    user,
    loading,
    activeTab,
    setActiveTab,
    businesses,
    requests,
    searchTerm,
    setSearchTerm,
    selectedRequest,
    showCreateModal,
    setShowCreateModal,
    dashboardStats,
    pendingRequests,
    filteredBusinesses,
    filters,
    setFilters,
    expiringSubscriptionsCount,
    handleToggleBusinessStatus,
    handleApproveRequest,
    handleRejectRequest,
    handleApproveAndCreate,
    handleCreateBusiness,
    handleLogout,
    router
  }
}