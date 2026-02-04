// frontend/components/super-admin/components/SuperAdminDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, Package, ShoppingCart, Shield } from 'lucide-react'
import StatCard from './StatCard'
import type { Business, User } from '../types'

interface SuperAdminDashboardProps {
  user: User
  onLogout: () => void
}

export default function SuperAdminDashboard({ user, onLogout }: SuperAdminDashboardProps) {
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

  const totalUsers = businesses.reduce((sum: number, b: any) => sum + (b._count?.users || 0), 0)
  const totalProducts = businesses.reduce((sum: number, b: any) => sum + (b._count?.products || 0), 0)
  const totalOrders = businesses.reduce((sum: number, b: any) => sum + (b._count?.orders || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsGrid 
          totalBusinesses={businesses.length}
          totalUsers={totalUsers}
          totalProducts={totalProducts}
          totalOrders={totalOrders}
        />

        <ManageBusinessSection router={router} />

        <BusinessesList businesses={businesses} router={router} />
      </div>
    </div>
  )
}

function DashboardHeader({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
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
  )
}

function StatsGrid({ 
  totalBusinesses, 
  totalUsers, 
  totalProducts, 
  totalOrders 
}: { 
  totalBusinesses: number
  totalUsers: number
  totalProducts: number
  totalOrders: number
}) {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={<Building2 className="w-8 h-8 text-blue-600" />}
        label="Total Businesses"
        value={totalBusinesses}
        bgColor="bg-blue-50"
      />
      <StatCard
        icon={<Users className="w-8 h-8 text-green-600" />}
        label="Total Users"
        value={totalUsers}
        bgColor="bg-green-50"
      />
      <StatCard
        icon={<Package className="w-8 h-8 text-purple-600" />}
        label="Total Products"
        value={totalProducts}
        bgColor="bg-purple-50"
      />
      <StatCard
        icon={<ShoppingCart className="w-8 h-8 text-orange-600" />}
        label="Total Orders"
        value={totalOrders}
        bgColor="bg-orange-50"
      />
    </div>
  )
}

function ManageBusinessSection({ router }: { router: any }) {
  return (
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
  )
}

function BusinessesList({ businesses, router }: { businesses: Business[]; router: any }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Businesses</h3>
      </div>

      {businesses.length === 0 ? (
        <EmptyBusinessesState />
      ) : (
        <div className="divide-y divide-gray-200">
          {businesses.map((business) => (
            <BusinessListItem key={business.id} business={business} router={router} />
          ))}
        </div>
      )}
    </div>
  )
}

function BusinessListItem({ business, router }: { business: Business; router: any }) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
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
  )
}

function EmptyBusinessesState() {
  return (
    <div className="p-12 text-center">
      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-600">No businesses yet. Create your first one!</p>
    </div>
  )
}