// frontend/components/super-admin/types/index.ts
export interface Business {
  id: number
  slug: string
  businessName: string
  businessType: string
  logo?: string
  description?: string
  phone: string
  whatsappNumber: string
  primaryColor: string
  secondaryColor: string
  _count?: {
    users?: number
    products?: number
    orders?: number
  }
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
  businessId?: number
  createdAt: string
  updatedAt: string
}

export interface OnboardingFormData {
  businessName: string
  businessType: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  description: string
  preferredSlug: string
}