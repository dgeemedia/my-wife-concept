// frontend/app/platform/dashboard/types/index.ts - Updated ActiveTab
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
  // Inherits ALL fields from SharedBusiness including all subscription fields
  
  _count?: {
    users: number
    products: number
    orders: number
  }
  
  // Dashboard-specific computed fields
  formattedSubscriptionExpiry?: string
  formattedSubscriptionStart?: string
  formattedTrialEnd?: string
  isSubscriptionExpiring?: boolean
  daysUntilExpiry?: number
  subscriptionStatus?: 'trial' | 'trial_expired' | 'active' | 'expiring_soon' | 'expired' | 'none'
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
  
  // ✅ Enhanced Subscription metrics
  subscribedBusinesses?: number
  expiringSoon?: number
  expiredSubscriptions?: number
  trialBusinesses?: number
  monthlySubscribers?: number
  annualSubscribers?: number
  
  // Recent activities
  recentSubscriptions?: DashboardBusiness[]
  expiringSubscriptions?: DashboardBusiness[]
  recentRequests?: OnboardingRequest[]
}

// ============================================================================
// DASHBOARD-SPECIFIC TYPES
// ============================================================================

export type ActiveTab = 'overview' | 'businesses' | 'requests' | 'settings'

// For the create business modal
export interface CreateBusinessFromRequestData {
  requestId: number
  businessName: string
  businessType: string
  ownerEmail: string
  ownerName: string
  ownerPhone: string
  preferredSlug?: string
  sendWelcomeEmail?: boolean
  temporaryPassword?: string
  subscriptionPlan?: 'none' | 'free_trial' | 'monthly' | 'annual'
  subscriptionDuration?: number // days
  subscriptionExpiry?: string
  trialDuration?: number // days (default 14)
}

// For business status management
export interface BusinessStatusUpdate {
  businessId: number
  isActive: boolean
  suspensionReason?: string
  subscriptionPlan?: 'none' | 'free_trial' | 'monthly' | 'annual'
  subscriptionExpiry?: string
}

// ✅ NEW: For subscription management
export interface SubscriptionUpdateData {
  businessId: number
  plan: 'none' | 'free_trial' | 'monthly' | 'annual'
  startDate?: string
  customExpiryDate?: string
  notes?: string
  activateBusiness?: boolean
  trialDuration?: number
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

// ✅ Enhanced subscription filtering
export interface SubscriptionFilters {
  status: 'all' | 'trial' | 'active' | 'expiring' | 'expired' | 'none'
  plan?: 'all' | 'free_trial' | 'monthly' | 'annual' | 'none'
  daysThreshold?: number
}

// For pagination in dashboard tables
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Enhanced business table data with subscription info
export interface BusinessTableData {
  id: number
  businessName: string
  slug: string
  businessType: string
  status: 'active' | 'suspended'
  subscriptionStatus: 'trial' | 'trial_expired' | 'active' | 'expiring_soon' | 'expired' | 'none'
  subscriptionPlan?: string
  subscriptionExpiry?: string
  trialEndsAt?: string
  users: number
  products: number
  orders: number
  createdAt: string
  lastOrder?: string
  daysUntilExpiry?: number
  trialDaysRemaining?: number
}

// Enhanced request table data
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
  reviewedAt?: string
  rejectionReason?: string
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

// Enhanced modal state
export interface ModalState {
  isOpen: boolean
  type: 'create-business' | 'suspend-business' | 'reject-request' | 'update-subscription' | 'view-subscription' | null
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
  field: 'businessName' | 'ownerEmail' | 'ownerPhone' | 'slug' | 'subscriptionStatus' | 'subscriptionPlan'
}

// Enhanced filter state
export interface FilterState {
  status?: ('active' | 'suspended')[]
  subscriptionStatus?: ('trial' | 'trial_expired' | 'active' | 'expiring_soon' | 'expired' | 'none')[]
  subscriptionPlan?: ('free_trial' | 'monthly' | 'annual' | 'none')[]
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

// Subscription plan details
export interface SubscriptionPlanDetails {
  id: 'free_trial' | 'monthly' | 'annual' | 'none'
  name: string
  description: string
  duration: number // days
  color: string
  icon: string
  features: string[]
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
  subscriptionPlan?: string
  subscriptionExpiry?: string
  trialEndsAt?: string
  message: string
}

export interface BusinessStatusResponse {
  success: boolean
  businessId: number
  isActive: boolean
  suspendedAt?: string
  suspensionReason?: string
  subscriptionExpiry?: string
  message: string
}

// Enhanced subscription response
export interface SubscriptionUpdateResponse {
  success: boolean
  businessId: number
  subscriptionPlan: string
  subscriptionExpiry?: string
  trialEndsAt?: string
  isActive: boolean
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

// Enhanced helper function to calculate subscription status
export function getSubscriptionStatus(
  business: DashboardBusiness
): 'trial' | 'trial_expired' | 'active' | 'expiring_soon' | 'expired' | 'none' {
  const now = new Date()
  
  // Check for trial
  if (business.subscriptionPlan === 'free_trial' && business.trialEndsAt) {
    const trialEnd = new Date(business.trialEndsAt)
    if (trialEnd > now) {
      return 'trial'
    } else {
      return 'trial_expired'
    }
  }
  
  // Check for subscription expiry
  if (business.subscriptionExpiry) {
    const expiry = new Date(business.subscriptionExpiry)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)
    
    if (expiry < now) {
      return 'expired'
    } else if (expiry <= thirtyDaysFromNow) {
      return 'expiring_soon'
    } else {
      return 'active'
    }
  }
  
  return 'none'
}

// Helper function to get subscription plan details
export function getSubscriptionPlanDetails(plan?: string): SubscriptionPlanDetails | null {
  const plans: Record<string, SubscriptionPlanDetails> = {
    free_trial: {
      id: 'free_trial',
      name: 'Free Trial',
      description: '14-day trial period',
      duration: 14,
      color: 'yellow',
      icon: 'Clock',
      features: ['Full access for 14 days', 'All features included', 'No credit card required']
    },
    monthly: {
      id: 'monthly',
      name: 'Monthly',
      description: 'Monthly subscription',
      duration: 30,
      color: 'blue',
      icon: 'CreditCard',
      features: ['Billed monthly', 'Full access', 'Priority support']
    },
    annual: {
      id: 'annual',
      name: 'Annual',
      description: 'Annual subscription (save 20%)',
      duration: 365,
      color: 'green',
      icon: 'Calendar',
      features: ['Billed annually', 'Save 20%', 'Full access', 'Priority support']
    },
    none: {
      id: 'none',
      name: 'No Plan',
      description: 'No active subscription',
      duration: 0,
      color: 'gray',
      icon: 'X',
      features: ['Limited features', 'Basic access only']
    }
  }
  
  return plan ? plans[plan] || null : null
}

// Helper function to format expiry date
export function formatExpiryDate(expiryDate?: string): string {
  if (!expiryDate) return 'No expiry date'
  
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

// Helper function to calculate trial days remaining
export function getTrialDaysRemaining(trialEndsAt?: string): number | null {
  if (!trialEndsAt) return null
  
  const endDate = new Date(trialEndsAt)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}