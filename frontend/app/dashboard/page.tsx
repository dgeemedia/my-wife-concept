// frontend/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react'
import api from '@/lib/api'

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalStaff: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch data with error handling
      const [products, ordersRes, users] = await Promise.all([
        api.get('/products').catch(() => []),
        api.get('/orders?limit=5').catch(() => ({ orders: [] })),
        api.get('/users').catch(() => []),
      ])

      // Handle orders response - backend returns { success: true, orders: [], pagination: {} }
      const orders = ordersRes?.orders || ordersRes || []
      
      // Calculate revenue from confirmed orders
      const confirmedOrders = Array.isArray(orders) ? 
        orders.filter((order: any) => order.paymentStatus === 'CONFIRMED') : []
      
      const revenue = confirmedOrders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      )

      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue: revenue,
        totalStaff: Array.isArray(users) ? 
          users.filter((user: any) => user.role === 'staff').length : 0,
      })

      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Failed to load dashboard data')
      // Set default data for testing
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalStaff: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Card 1 */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">+12% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stats Card 2 */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">+23% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stats Card 3 */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">+18% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stats Card 4 */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Staff Members</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStaff}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">+2 new staff</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.customerName || 'N/A'}</div>
                        <div className="text-gray-500">{order.phone || ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}