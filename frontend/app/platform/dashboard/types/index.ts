import { 
  Business as SharedBusiness,
  OnboardingRequest as SharedOnboardingRequest,
  DashboardStats as SharedDashboardStats
} from '../../../../types'

// ============================================================================
// TYPES THAT EXTEND SHARED TYPES
// ============================================================================

// Extend the shared type with dashboard-specific computed fields
export interface OnboardingRequest extends SharedOnboardingRequest {
  // Dashboard-specific computed fields
  daysSinceCreation?: number
  formattedCreatedAt?: string
  isRecent?: boolean // Requests from last 7 days
}

// Dashboard-specific business with counts
export interface DashboardBusiness extends SharedBusiness {
  // Inherits ALL fields from SharedBusiness including:
  // - isActive: boolean
  // - suspendedAt?: string
  // - suspensionReason?: string
  // - subscriptionExpiry?: string ✅ Now included!
  // - ... all other Business fields
  
  _count?: {
    users: number
    products: number
    orders: number
  }
  
  // You can add dashboard-specific computed fields here
  formattedSubscriptionExpiry?: string
  isSubscriptionExpiring?: boolean
  daysUntilExpiry?: number
}

// Dashboard-specific stats with additional metrics
export interface DashboardStats extends SharedDashboardStats {
  // Additional dashboard-specific metrics
  activeBusinesses?: number
  suspendedBusinesses?: number
  approvedRequests?: number
  rejectedRequests?: number
  revenue?: number
  growthRate?: number
  
  // ✅ NEW: Subscription metrics
  subscribedBusinesses?: number
  expiringSoon?: number
  expiredSubscriptions?: number
}

// ============================================================================
// DASHBOARD-SPECIFIC TYPES
// ============================================================================

export type ActiveTab = 'overview' | 'businesses' | 'requests'

// For the create business modal
export interface CreateBusinessFromRequestData {
  requestId: number
  businessName: string
  businessType: string
  ownerEmail: string
  preferredSlug?: string
  sendWelcomeEmail?: boolean
  temporaryPassword?: string
  subscriptionDuration?: number // days
  subscriptionExpiry?: string
}

// For business status management
export interface BusinessStatusUpdate {
  businessId: number
  isActive: boolean
  suspensionReason?: string
  subscriptionExpiry?: string
}

// For request filtering
export interface RequestFilters {
  status?: 'pending' | 'approved' | 'rejected'
  dateRange?: {
    start: string
    end: string
  }
  search?: string
  businessType?: string
}

// ✅ NEW: For subscription filtering
export interface SubscriptionFilters {
  status: 'active' | 'expiring' | 'expired' | 'all'
  daysThreshold?: number
}

// For pagination in dashboard tables
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// For business table data
export interface BusinessTableData {
  id: number
  businessName: string
  slug: string
  businessType: string
  status: 'active' | 'suspended'
  subscriptionStatus: 'active' | 'expiring' | 'expired' | 'none'
  users: number
  products: number
  orders: number
  createdAt: string
  lastOrder?: string
  subscriptionExpiry?: string
  daysUntilExpiry?: number
}

// For request table data
export interface RequestTableData {
  id: number
  businessName: string
  ownerName: string
  ownerEmail: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  daysOld: number
  businessType: string
  preferredSlug?: string
}

// Dashboard card metrics
export interface DashboardCard {
  title: string
  value: number | string
  icon: string
  color: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  subtext?: string
}

// Quick action button
export interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  onClick: () => void
  disabled?: boolean
}

// Modal state
export interface ModalState {
  isOpen: boolean
  type: 'create-business' | 'suspend-business' | 'reject-request' | 'update-subscription' | null
  data?: any
}

// Toast notification
export interface DashboardToast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
}

// Search state
export interface SearchState {
  query: string
  field: 'businessName' | 'ownerEmail' | 'ownerPhone' | 'slug' | 'subscriptionStatus'
}

// Filter state
export interface FilterState {
  status?: ('active' | 'suspended')[]
  subscriptionStatus?: ('active' | 'expiring' | 'expired' | 'none')[]
  businessType?: string[]
  dateRange?: {
    from: string
    to: string
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// Chart data
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
  }[]
}

// ============================================================================
// API RESPONSE TYPES (Dashboard-specific)
// ============================================================================

export interface DashboardApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateBusinessResponse {
  success: boolean
  businessId: number
  adminUserId?: number
  temporaryPassword?: string
  subscriptionExpiry?: string
  message: string
}

export interface BusinessStatusResponse {
  success: boolean
  businessId: number
  isActive: boolean
  suspendedAt?: string
  subscriptionExpiry?: string
  message: string
}

// ✅ NEW: Subscription response
export interface SubscriptionUpdateResponse {
  success: boolean
  businessId: number
  subscriptionExpiry: string
  message: string
}

export interface RequestActionResponse {
  success: boolean
  requestId: number
  action: 'approve' | 'reject' | 'create-business'
  message: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// For form handling
export type FormErrors<T> = Partial<Record<keyof T, string>>

// For loading states
export interface LoadingState {
  isLoading: boolean
  action?: string
}

// For dropdown selections
export interface Option<T = string> {
  value: T
  label: string
  disabled?: boolean
}

// For breadcrumbs
export interface Breadcrumb {
  label: string
  href: string
  active?: boolean
}

// For tab configuration
export interface TabConfig {
  id: ActiveTab
  label: string
  icon: string
  badge?: number
  disabled?: boolean
}

// For table columns
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  render?: (value: any, item: T) => React.ReactNode
}

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Re-export the base types for convenience
export type { SharedBusiness as Business, SharedOnboardingRequest, SharedDashboardStats }

// Helper function to calculate subscription status
export function getSubscriptionStatus(expiryDate?: string): 'active' | 'expiring' | 'expired' | 'none' {
  if (!expiryDate) return 'none'
  
  const expiry = new Date(expiryDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)
  
  if (expiry < today) return 'expired'
  if (expiry <= thirtyDaysFromNow) return 'expiring'
  return 'active'
}

// Helper function to format expiry date
export function formatExpiryDate(expiryDate?: string): string {
  if (!expiryDate) return 'No subscription'
  
  const date = new Date(expiryDate)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to calculate days until expiry
export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null
  
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}