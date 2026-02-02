// frontend/types/index.ts
export interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
  imageUrl?: string
  featured?: boolean
  averageRating?: number
  totalRatings?: number
  recentRatings?: ProductRating[]
  images?: ProductImage[]
  businessId: number  // ✅ ADDED
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

export interface Order {
  id: number
  customerName: string
  phone: string
  email?: string
  address?: string
  message?: string
  items: OrderItem[]
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  paymentConfirmedAt?: string
  paymentConfirmedBy?: number
  notes?: string
  currency: string
  businessId: number  // ✅ ADDED
  createdAt: string
  updatedAt: string
  statusHistory: OrderStatusHistory[]
}

export interface OrderItem {
  id: number
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

export interface User {
  id: number
  email: string
  role: 'super-admin' | 'admin' | 'staff'
  firstName?: string
  lastName?: string
  phone?: string
  active: boolean
  businessId?: number  // ✅ ADDED - null for super-admin, required for others
  lastLogin?: string
  createdAt: string
}

// ✅ NEW: Business model
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
  primaryColor: string
  secondaryColor: string
  currency: string
  language: string
  supportedLanguages?: string[]
  autoDetectLanguage: boolean
  defaultLanguage: string
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

// ✅ DEPRECATED: Keep for backward compatibility during migration
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

export interface CartItem {
  product: Product
  quantity: number
}

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
  businessId?: number  // ✅ ADDED
  createdAt: string
}

export interface NotificationResponse {
  success: boolean
  notifications: Notification[]
  unreadCount: number
}

export interface ApiResponse<T = any> {
  ok?: boolean
  success?: boolean
  data?: T
  error?: string
  message?: string
}

// ✅ NEW: Auth response with businessId
export interface AuthResponse {
  ok: boolean
  token: string
  user: {
    id: number
    email: string
    role: 'super-admin' | 'admin' | 'staff'
    businessId?: number  // ✅ ADDED
    firstName?: string
    lastName?: string
  }
}

// ✅ NEW: JWT token payload
export interface JWTPayload {
  id: number
  email: string
  role: 'super-admin' | 'admin' | 'staff'
  businessId?: number  // ✅ ADDED
  iat?: number
  exp?: number
}