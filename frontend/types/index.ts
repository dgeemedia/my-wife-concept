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
  lastLogin?: string
  createdAt: string
}

export interface BusinessSettings {
  id: number
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

// ⭐ NEW: Notification interface
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
  createdAt: string
}

// ⭐ NEW: Notification API response
export interface NotificationResponse {
  success: boolean
  notifications: Notification[]
  unreadCount: number
}

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  message?: string
  success?: boolean
}