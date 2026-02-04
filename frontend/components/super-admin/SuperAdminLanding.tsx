// frontend/components/super-admin/SuperAdminLanding.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, Users, Package, ShoppingCart, ArrowRight, Shield, 
  Store, MessageCircle, Mail, Phone, Send, Check, Filter, ExternalLink 
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Business {
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

const BUSINESS_TYPES = {
  food: { label: 'Food & Groceries', icon: '🍕', color: 'from-orange-500 to-red-500' },
  restaurant: { label: 'Restaurant', icon: '🍽️', color: 'from-red-500 to-pink-500' },
  hotel: { label: 'Hotel', icon: '🏨', color: 'from-blue-500 to-cyan-500' },
  shortlet: { label: 'Shortlet', icon: '🏠', color: 'from-purple-500 to-pink-500' },
  retail: { label: 'Retail Store', icon: '🛍️', color: 'from-green-500 to-emerald-500' },
  fashion: { label: 'Fashion & Clothing', icon: '👗', color: 'from-pink-500 to-rose-500' },
  electronics: { label: 'Electronics', icon: '📱', color: 'from-indigo-500 to-blue-500' },
  phones: { label: 'Phone & Gadgets', icon: '📱', color: 'from-cyan-500 to-blue-500' },
  computers: { label: 'Computers & IT', icon: '💻', color: 'from-gray-600 to-slate-600' },
  furniture: { label: 'Furniture', icon: '🛋️', color: 'from-amber-500 to-orange-500' },
  beauty: { label: 'Beauty & Cosmetics', icon: '💄', color: 'from-fuchsia-500 to-pink-500' },
  pharmacy: { label: 'Pharmacy & Health', icon: '💊', color: 'from-teal-500 to-green-500' },
  bookstore: { label: 'Books & Stationery', icon: '📚', color: 'from-blue-600 to-indigo-600' },
  sports: { label: 'Sports & Fitness', icon: '⚽', color: 'from-lime-500 to-green-600' },
  services: { label: 'Services', icon: '⚙️', color: 'from-indigo-500 to-blue-500' },
  other: { label: 'Other', icon: '💼', color: 'from-gray-500 to-slate-500' },
}

// Platform WhatsApp number (not from any specific business)
const PLATFORM_WHATSAPP = '2348110252143' // Your platform support number

export default function SuperAdminLanding() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeView, setActiveView] = useState<'landing' | 'businesses' | 'onboarding'>('landing')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)

        if (data.user.role === 'super-admin') {
          setActiveView('businesses')
        } else if (data.user.businessId) {
          const businessResponse = await fetch(`/api/business/${data.user.businessId}`)
          if (businessResponse.ok) {
            const business = await businessResponse.json()
            window.location.href = `http://${business.slug}.localhost:3000/dashboard`
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PublicLandingPage activeView={activeView} setActiveView={setActiveView} />
  }

  if (user?.role === 'super-admin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  return <PublicLandingPage activeView={activeView} setActiveView={setActiveView} />
}

// Public Landing Page with Three Views
function PublicLandingPage({ activeView, setActiveView }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <LandingHeader activeView={activeView} setActiveView={setActiveView} />
      
      {activeView === 'landing' && <HeroSection setActiveView={setActiveView} />}
      {activeView === 'businesses' && <BusinessesDirectory />}
      {activeView === 'onboarding' && <OnboardingForm />}
      
      <LandingFooter />
      <PlatformWhatsAppWidget />
    </div>
  )
}

// Landing Header
function LandingHeader({ activeView, setActiveView }: any) {
  const router = useRouter()
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('landing')}>
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MyPadiFood</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setActiveView('landing')}
              className={`${activeView === 'landing' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('businesses')}
              className={`${activeView === 'businesses' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Businesses
            </button>
            <button
              onClick={() => setActiveView('onboarding')}
              className={`${activeView === 'onboarding' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Start Your Business
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const message = encodeURIComponent('Hi, I need help with MyPadiFood platform')
                window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
              }}
              className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Contact Us</span>
            </button>
            <button
              onClick={() => router.push('/platform/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Hero Section
function HeroSection({ setActiveView }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to MyPadiFood
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your one-stop platform for multiple businesses. Browse our stores, or start your own business with us today.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
        <button
          onClick={() => setActiveView('businesses')}
          className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <Store className="w-6 h-6 mr-2" />
          Browse Businesses
        </button>
        <button
          onClick={() => setActiveView('onboarding')}
          className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <Building2 className="w-6 h-6 mr-2" />
          Start Your Business
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Building2 className="w-12 h-12 text-blue-600" />}
          title="Multiple Businesses"
          description="Discover various businesses all in one platform. From food to services, find what you need."
        />
        <FeatureCard
          icon={<Store className="w-12 h-12 text-green-600" />}
          title="Easy Onboarding"
          description="Start your business in minutes. Fill a simple form and our team will set you up."
        />
        <FeatureCard
          icon={<MessageCircle className="w-12 h-12 text-purple-600" />}
          title="24/7 Support"
          description="Get instant support through WhatsApp. Our team is always ready to help."
        />
      </div>
    </div>
  )
}

// Businesses Directory
function BusinessesDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/onboarding/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = selectedType === 'all' 
    ? businesses 
    : businesses.filter(b => b.businessType === selectedType)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Businesses</h2>
        <p className="text-xl text-gray-600">
          Discover amazing local businesses on our platform
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedType === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {Object.entries(BUSINESS_TYPES).map(([type, info]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              selectedType === type
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{info.icon}</span>
            {info.label}
          </button>
        ))}
      </div>

      {/* Businesses Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No businesses found in this category</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  )
}

// Business Card Component - FIXED
function BusinessCard({ business }: { business: Business }) {
  const businessInfo = BUSINESS_TYPES[business.businessType as keyof typeof BUSINESS_TYPES] || BUSINESS_TYPES.other
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
      <div className={`h-48 bg-gradient-to-br ${businessInfo.color} flex items-center justify-center relative overflow-hidden`}>
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl">{businessInfo.icon}</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{business.businessName}</h3>
            <span className="text-sm text-gray-500">{businessInfo.label}</span>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {business._count?.products || 0} Products
          </span>
        </div>
        
        {business.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>
        )}
        
        <a
          href={`http://${business.slug}.localhost:3000`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Visit Store
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  )
}

// Onboarding Form
function OnboardingForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'food',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    description: '',
    preferredSlug: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Application submitted successfully!')
        setSubmitted(true)
      } else {
        throw new Error(data.error || 'Failed to submit')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Your onboarding request has been submitted successfully. Our team will contact you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Start Your Business</h2>
        <p className="text-xl text-gray-600">
          Fill out the form below and our team will help you get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Business Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                placeholder="e.g., Fresh Farm Produce"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(BUSINESS_TYPES).map(([type, info]) => (
                  <option key={type} value={type}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred URL Slug
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="preferredSlug"
                  value={formData.preferredSlug}
                  onChange={handleChange}
                  pattern="[a-z0-9-]+"
                  placeholder="freshfarm"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                  .localhost:3000
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us about your business..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  required
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Application
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// Super Admin Dashboard
function SuperAdminDashboard({ user, onLogout }: any) {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Building2 className="w-8 h-8 text-blue-600" />}
            label="Total Businesses"
            value={businesses.length}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<Users className="w-8 h-8 text-green-600" />}
            label="Total Users"
            value={businesses.reduce((sum: number, b: any) => sum + (b._count?.users || 0), 0)}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<Package className="w-8 h-8 text-purple-600" />}
            label="Total Products"
            value={businesses.reduce((sum: number, b: any) => sum + (b._count?.products || 0), 0)}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<ShoppingCart className="w-8 h-8 text-orange-600" />}
            label="Total Orders"
            value={businesses.reduce((sum: number, b: any) => sum + (b._count?.orders || 0), 0)}
            bgColor="bg-orange-50"
          />
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Businesses</h2>
              <p className="text-gray-600">Create new businesses or manage existing ones</p>
            </div>
            <button
              onClick={() => router.push('/super-admin/businesses/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Create New Business
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Businesses</h3>
          </div>

          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No businesses yet. Create your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {businesses.map((business: Business) => (
                <div key={business.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {business.logo ? (
                          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Building2 className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{business.businessName}</h4>
                        <a 
                          href={`http://${business.slug}.localhost:3000`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {business.slug}.localhost:3000
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{business._count?.users || 0}</div>
                        <div>Users</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{business._count?.products || 0}</div>
                        <div>Products</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{business._count?.orders || 0}</div>
                        <div>Orders</div>
                      </div>
                      <button
                        onClick={() => router.push(`/super-admin/businesses/${business.id}`)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Platform WhatsApp Widget (uses platform number, not business-specific)
function PlatformWhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const openPlatformWhatsApp = () => {
    const message = encodeURIComponent('Hi, I need help with MyPadiFood platform')
    window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
    setIsOpen(false)
    toast.success('Opening WhatsApp...')
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="mb-4 w-[320px] animate-slide-up bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold">Chat with Us</h3>
                    <p className="text-sm">Platform Support</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <button
                onClick={openPlatformWhatsApp}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chat
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    </>
  )
}

// Landing Footer
function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6" />
              <span className="font-bold text-lg">MyPadiFood</span>
            </div>
            <p className="text-gray-400">
              Your trusted multi-business platform. Connecting customers with local businesses.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Businesses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Start Your Business</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+234 811 025 2143</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@mypadifood.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Support</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 MyPadiFood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode, label: string, value: number, bgColor: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}