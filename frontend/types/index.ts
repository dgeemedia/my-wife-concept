// frontend/types/index.ts

// ============================================================================
// CORE BUSINESS MODELS
// ============================================================================

export interface Business {
  id: number
  slug: string
  businessName: string
  businessType: string
  businessMotto?: string
  phone: string
  email?: string
  address?: string
  description?: string
  logo?: string
  
  // Theme
  primaryColor: string
  secondaryColor: string
  
  // Localization
  currency: string
  language: string
  supportedLanguages?: string[]
  autoDetectLanguage: boolean
  defaultLanguage: string
  
  // Contact & Social
  whatsappNumber: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  
  // Footer
  footerText?: string
  footerCopyright?: string
  footerAddress?: string
  footerEmail?: string
  footerPhone?: string
  
  // ✅ NEW: Subscription & Status Management (from Prisma schema)
  isActive: boolean
  suspendedAt?: string
  suspensionReason?: string
  subscriptionExpiry?: string
  
  createdAt: string
  updatedAt: string
}

// ============================================================================
// DEPRECATED: BusinessSettings - Keep for backward compatibility
// ============================================================================
export interface BusinessSettings {
  id: number
  slug: string
  businessName: string
  businessType: string
  businessMotto?: string
  phone: string
  email?: string
  address?: string
  description?: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  language: string
  whatsappNumber: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  footerText?: string
  footerCopyright?: string
  footerAddress?: string
  footerEmail?: string
  footerPhone?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================
export interface User {
  id: number
  email: string
  passwordHash?: string // Only for backend, optional in frontend
  role: 'super-admin' | 'admin' | 'staff'
  firstName?: string
  lastName?: string
  phone?: string
  active: boolean
  lastLogin?: string
  
  // Multi-tenant link
  businessId?: number  // null for super-admin, required for admin/staff
  business?: Business
  
  createdAt: string
  updatedAt: string
}

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================
export interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
  imageUrl?: string
  featured: boolean
  
  // Multi-tenant link
  businessId: number
  business?: Business
  
  // Calculated fields (from relations)
  averageRating?: number
  totalRatings?: number
  recentRatings?: ProductRating[]
  images?: ProductImage[]
  
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: number
  productId: number
  imageUrl: string
  order: number
  isPrimary: boolean
  createdAt: string
}

export interface ProductRating {
  id: number
  productId: number
  phone: string
  rating: number
  comment?: string
  createdAt: string
}

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================
export interface Order {
  id: number
  customerName: string
  phone: string
  email?: string
  address?: string
  message?: string
  
  items: OrderItem[]
  totalAmount: number
  
  // Status tracking
  status: string  // PENDING, PROCESSING, COMPLETED, CANCELLED, etc.
  paymentStatus: string  // PENDING, PAID, FAILED, REFUNDED, etc.
  paymentMethod?: string
  paymentConfirmedAt?: string
  paymentConfirmedBy?: number
  paymentConfirmer?: User
  
  // Additional info
  notes?: string
  currency: string
  statusHistory?: OrderStatusHistory[]  // JSON field in Prisma
  
  // Multi-tenant link
  businessId: number
  business?: Business
  
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  product?: Product
}

export interface OrderStatusHistory {
  status: string
  timestamp: string
  notes?: string
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export interface Notification {
  id: number
  type: 'order' | 'payment' | 'stock' | 'system'
  title: string
  message: string
  link?: string
  orderId?: number
  productId?: number
  read: boolean
  readAt?: string
  
  // Multi-tenant link
  businessId?: number
  business?: Business
  
  createdAt: string
}

export interface NotificationResponse {
  success: boolean
  notifications: Notification[]
  unreadCount: number
}

// ============================================================================
// ONBOARDING REQUESTS (for platform dashboard)
// ============================================================================
export interface OnboardingRequest {
  id: number
  businessName: string
  businessType: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  description?: string
  preferredSlug?: string
  
  // Status tracking
  status: 'pending' | 'approved' | 'rejected'
  adminCreated: boolean
  adminUserId?: number
  temporaryPassword?: string
  reviewedBy?: number
  reviewedAt?: string
  rejectionReason?: string
  
  createdAt: string
  updatedAt: string
}

// ============================================================================
// SHOPPING CART
// ============================================================================
export interface CartItem {
  product: Product
  quantity: number
}

// ============================================================================
// API RESPONSES
// ============================================================================
export interface ApiResponse<T = any> {
  ok?: boolean
  success?: boolean
  data?: T
  error?: string
  message?: string
}

// ============================================================================
// AUTHENTICATION
// ============================================================================
export interface AuthResponse {
  ok: boolean
  token: string
  user: {
    id: number
    email: string
    role: 'super-admin' | 'admin' | 'staff'
    businessId?: number
    firstName?: string
    lastName?: string
  }
}

export interface JWTPayload {
  id: number
  email: string
  role: 'super-admin' | 'admin' | 'staff'
  businessId?: number
  iat?: number
  exp?: number
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// For Prisma JSON fields
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter/Sort options
export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

// Dashboard statistics
export interface DashboardStats {
  totalBusinesses?: number
  activeBusinesses?: number
  suspendedBusinesses?: number
  totalProducts?: number
  totalOrders?: number
  totalUsers?: number
  pendingRequests?: number
  recentOrders?: Order[]
  lowStockProducts?: Product[]
}