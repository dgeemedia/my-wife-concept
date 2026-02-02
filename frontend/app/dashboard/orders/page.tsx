// frontend/app/dashboard/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck, Package, X, Download, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Order } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { exportOrdersToExcel, exportCustomersToExcel } from '@/lib/exportToExcel'
import { useCurrency } from '@/components/dashboard/CurrencyProvider'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
type PaymentStatus = 'PENDING' | 'CONFIRMED'

export default function OrdersPage() {
  const { t } = useTranslation('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { format, currency: businessCurrency } = useCurrency()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.orders || [])
    } catch (error) {
      toast.error(t('messages.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (orderId: number) => {
    if (!confirm(t('messages.confirm.payment'))) return

    try {
      const response = await api.post(`/orders/${orderId}/confirm-payment`, {
        paymentMethod: 'BANK_TRANSFER'
      })
      
      setOrders(orders.map(o => o.id === orderId ? response.order : o))
      toast.success(t('messages.success.confirmed'))
    } catch (error) {
      toast.error(t('messages.error.updateFailed'))
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by staff`
      })
      
      setOrders(orders.map(o => o.id === orderId ? response.order : o))
      toast.success(t('messages.success.updated'))
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.order)
      }
    } catch (error) {
      toast.error(t('messages.error.updateFailed'))
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    return status === 'CONFIRMED' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search) ||
      order.id.toString().includes(search)
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
        <p className="text-gray-600">{t('orders.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('orders.searchByOrderId')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">{t('orders.allOrders')}</option>
              <option value="PENDING">{t('orders.statuses.pending')}</option>
              <option value="CONFIRMED">{t('orders.statuses.confirmed')}</option>
              <option value="PREPARING">{t('orders.statuses.preparing')}</option>
              <option value="OUT_FOR_DELIVERY">{t('orders.statuses.outForDelivery')}</option>
              <option value="DELIVERED">{t('orders.statuses.delivered')}</option>
              <option value="CANCELLED">{t('orders.statuses.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportOrdersToExcel(filteredOrders, 'orders')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('orders.exportOrders')}
          </button>
          
          <button
            onClick={() => exportCustomersToExcel(orders, 'customers')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('orders.exportCustomers')}
          </button>
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('orders.statuses.pending')}</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('orders.statuses.confirmed')}</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === 'CONFIRMED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.stats.inTransit')}</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length}
              </p>
            </div>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('orders.statuses.delivered')}</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('orders.noOrders')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('orders.orderID')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('orders.customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('orders.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('orders.currency')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('orders.payment')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('orders.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-primary-600">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold">{format(order.totalAmount, order.currency)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {order.currency}
                        {order.currency !== businessCurrency && (
                          <span className="ml-1 text-yellow-600" title={t('orders.differentCurrency')}>⚠️</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={t('orders.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {order.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => handleConfirmPayment(order.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title={t('orders.confirmPayment')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false)
            setSelectedOrder(null)
          }}
          onUpdateStatus={handleUpdateStatus}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ 
  order, 
  onClose, 
  onUpdateStatus, 
  onConfirmPayment 
}: { 
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: number, status: OrderStatus) => void
  onConfirmPayment: (orderId: number) => void
}) {
  const { t } = useTranslation('dashboard')
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status as OrderStatus)
  const { format, currency: businessCurrency } = useCurrency()
  
  const statusOptions: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onUpdateStatus(order.id, selectedStatus)
    }
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      PREPARING: Package,
      OUT_FOR_DELIVERY: Truck,
      DELIVERED: CheckCircle,
      CANCELLED: XCircle,
    }
    const Icon = icons[status] || Clock
    return <Icon className="w-5 h-5" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{t('orders.orderID')} #{order.id}</h2>
              <p className="text-sm text-gray-600">
                {t('orders.placedOn')} {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.currency !== businessCurrency && (
                <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {t('orders.orderMadeDifferentCurrency', { 
                      currency: order.currency, 
                      businessCurrency: businessCurrency 
                    })}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3">{t('orders.customerInformation')}</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders.customerName')}:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders.phone')}:</span>
                <span className="font-medium">{order.phone}</span>
              </div>
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.email')}:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
              )}
              {order.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.address')}:</span>
                  <span className="font-medium">{order.address}</span>
                </div>
              )}
              {order.message && (
                <div>
                  <span className="text-gray-600">{t('orders.message')}:</span>
                  <p className="mt-1 text-sm">{order.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">{t('orders.orderItems')}</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{item.product?.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">{t('orders.quantity')}: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(item.unitPrice * item.quantity, order.currency)}</p>
                    <p className="text-sm text-gray-600">{format(item.unitPrice, order.currency)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-lg">{t('orders.totalAmount')}:</span>
              <span className="font-bold text-2xl text-primary-600">
                {format(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h3 className="font-semibold mb-3">{t('orders.paymentStatus')}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('orders.status')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentStatus === 'PENDING' && (
                <button
                  onClick={() => onConfirmPayment(order.id)}
                  className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('orders.confirmPaymentReceived')}
                </button>
              )}
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h3 className="font-semibold mb-3">{t('orders.orderStatus')}</h3>
            <div className="space-y-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {t(`orders.statuses.${status.toLowerCase().replace(/_/g, '')}`)}
                  </option>
                ))}
              </select>
              
              {selectedStatus !== order.status && (
                <button
                  onClick={handleStatusUpdate}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('orders.updateStatus')} to {selectedStatus}
                </button>
              )}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t('orders.statusHistory')}</h3>
              <div className="space-y-2">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    {getStatusIcon(history.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{history.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}