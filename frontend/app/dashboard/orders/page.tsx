// frontend/app/dashboard/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck, Package, X, Download, AlertTriangle } from 'lucide-react'
import { Order } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { exportOrdersToExcel, exportCustomersToExcel } from '@/lib/exportToExcel'
import { useCurrency } from '@/components/dashboard/CurrencyProvider'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
type PaymentStatus = 'PENDING' | 'CONFIRMED'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { format, businessCurrency } = useCurrency()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.orders || [])
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (orderId: number) => {
    if (!confirm('Confirm that payment has been received for this order?')) return

    try {
      const response = await api.post(`/orders/${orderId}/confirm-payment`, {
        paymentMethod: 'BANK_TRANSFER'
      })
      
      setOrders(orders.map(o => o.id === orderId ? response.order : o))
      toast.success('Payment confirmed successfully')
    } catch (error) {
      toast.error('Failed to confirm payment')
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by staff`
      })
      
      setOrders(orders.map(o => o.id === orderId ? response.order : o))
      toast.success(`Order status updated to ${newStatus}`)
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.order)
      }
    } catch (error) {
      toast.error('Failed to update status')
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
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Track and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
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
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
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
            Export Orders to Excel
          </button>
          
          <button
            onClick={() => exportCustomersToExcel(orders, 'customers')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Customer Data
          </button>
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
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
              <p className="text-sm text-gray-600">Confirmed</p>
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
              <p className="text-sm text-gray-600">In Transit</p>
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
              <p className="text-sm text-gray-600">Delivered</p>
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
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
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
                          <span className="ml-1 text-yellow-600" title="Different from current currency">⚠️</span>
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
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {order.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => handleConfirmPayment(order.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Confirm Payment"
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
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status as OrderStatus)
  const { format, businessCurrency } = useCurrency()

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
              <h2 className="text-xl font-bold">Order #{order.id}</h2>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.currency !== businessCurrency && (
                <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>This order was made in {order.currency} (Current: {businessCurrency})</span>
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
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{order.phone}</span>
              </div>
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
              )}
              {order.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{order.address}</span>
                </div>
              )}
              {order.message && (
                <div>
                  <span className="text-gray-600">Message:</span>
                  <p className="mt-1 text-sm">{order.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{item.product?.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(item.unitPrice * item.quantity, order.currency)}</p>
                    <p className="text-sm text-gray-600">{format(item.unitPrice, order.currency)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-lg">Total Amount:</span>
              <span className="font-bold text-2xl text-primary-600">
                {format(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h3 className="font-semibold mb-3">Payment Status</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
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
                  Confirm Payment Received
                </button>
              )}
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h3 className="font-semibold mb-3">Order Status</h3>
            <div className="space-y-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              {selectedStatus !== order.status && (
                <button
                  onClick={handleStatusUpdate}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status to {selectedStatus}
                </button>
              )}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Status History</h3>
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
            Close
          </button>
        </div>
      </div>
    </div>
  )
}