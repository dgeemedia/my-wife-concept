// frontend/app/dashboard/orders/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Package, Phone, Mail, MapPin, MessageSquare, DollarSign, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import { Order } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/orders/${orderId}`)
      setOrder(data.order)
      setStatus(data.order.status)
    } catch (error) {
      toast.error('Failed to load order')
      router.push('/dashboard/orders')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!status) return

    setUpdating(true)
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success('Order status updated')
      fetchOrder()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const confirmPayment = async () => {
    setUpdating(true)
    try {
      await api.post(`/orders/${orderId}/confirm-payment`, { paymentMethod })
      toast.success('Payment confirmed')
      fetchOrder()
    } catch (error) {
      toast.error('Failed to confirm payment')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'PREPARING': return <Package className="w-5 h-5 text-orange-500" />
      case 'OUT_FOR_DELIVERY': return <Truck className="w-5 h-5 text-purple-500" />
      case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/orders"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id}
            </h1>
            <p className="text-gray-600">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{order.phone}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>

              {order.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{order.email}</p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>
              )}

              {order.address && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{order.address}</p>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                  </div>
                </div>
              )}

              {order.message && (
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{order.message}</p>
                    <p className="text-sm text-gray-500">Message</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{item.product?.name}</h4>
                      <p className="text-sm text-gray-500">
                        ₦{item.unitPrice.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold">
                    ₦{(item.unitPrice * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>₦0</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ₦{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-medium">{order.status}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button
                  onClick={updateStatus}
                  disabled={updating || status === order.status}
                  className="w-full mt-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-medium">Status</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus}
                </div>
              </div>

              {order.paymentStatus === 'PENDING' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="CASH">Cash</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="CARD">Card</option>
                    </select>
                  </div>
                  <button
                    onClick={confirmPayment}
                    disabled={updating}
                    className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Confirming...' : 'Confirm Payment'}
                  </button>
                </>
              )}

              {order.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
                  {order.paymentConfirmedAt && (
                    <p className="text-sm text-gray-600">
                      Confirmed: {new Date(order.paymentConfirmedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory?.map((history, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(history.status)}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{history.status}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(history.timestamp).toLocaleString()}
                    </p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}