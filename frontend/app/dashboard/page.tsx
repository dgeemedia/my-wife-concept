// frontend/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useCurrency } from '@/components/dashboard/CurrencyProvider'

export default function DashboardHome() {
  const { t } = useTranslation('dashboard')
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalStaff: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { format } = useCurrency()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [products, ordersRes, users] = await Promise.all([
        api.get('/products').catch(() => []),
        api.get('/orders?limit=5').catch(() => ({ orders: [] })),
        api.get('/users').catch(() => []),
      ])

      const orders = ordersRes?.orders || ordersRes || []
      
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
      setError(t('messages.error.loadFailed'))
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('dashboard.title')}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Card 1 */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t('dashboard.stats.totalProducts')}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">
                +12% {t('dashboard.from')} {t('dashboard.lastMonth')}
              </p>
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
              <p className="text-sm text-gray-500 mb-1">
                {t('dashboard.stats.totalOrders')}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">
                +23% {t('dashboard.from')} {t('dashboard.lastMonth')}
              </p>
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
              <p className="text-sm text-gray-500 mb-1">
                {t('dashboard.stats.totalRevenue')}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{format(stats.totalRevenue)}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">
                +18% {t('dashboard.from')} {t('dashboard.lastMonth')}
              </p>
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
              <p className="text-sm text-gray-500 mb-1">
                {t('dashboard.stats.staffMembers')}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStaff}</h3>
              <p className="text-sm font-medium text-green-600 mt-2">
                +2 {t('dashboard.new')}
              </p>
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
          <h2 className="text-lg font-semibold">{t('dashboard.recentOrders')}</h2>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {t('orders.noOrders')}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.orderID')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.date')}
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
                      {format(order.totalAmount || 0)}
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
                        {t(`orders.statuses.${order.status?.toLowerCase()}`) || order.status || 'PENDING'}
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