// frontend/app/dashboard/orders/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Clock, Truck, Package, AlertTriangle, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Order } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useCurrency } from '@/components/dashboard/CurrencyProvider'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id
  const { t } = useTranslation('dashboard')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING')
  const { format, currency: businessCurrency } = useCurrency()

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/orders/${orderId}`)
      setOrder(response.order || response)
      if (response.order || response) {
        setSelectedStatus((response.order?.status || response.status) as OrderStatus)
      }
    } catch (error) {
      toast.error(t('messages.error.loadFailed'))
      router.push('/dashboard/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!order || !confirm(t('messages.confirm.payment'))) return

    try {
      const response = await api.post(`/orders/${order.id}/confirm-payment`, {
        paymentMethod: 'BANK_TRANSFER'
      })
      
      setOrder(response.order)
      toast.success(t('messages.success.confirmed'))
    } catch (error) {
      toast.error(t('messages.error.updateFailed'))
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || selectedStatus === order.status) return

    try {
      const response = await api.patch(`/orders/${order.id}/status`, {
        status: selectedStatus,
        notes: `Status updated to ${selectedStatus} by staff`
      })
      
      setOrder(response.order)
      toast.success(t('messages.success.updated'))
    } catch (error) {
      toast.error(t('messages.error.updateFailed'))
    }
  }

  const handlePrintReceipt = () => {
    window.print()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t('orders.orderNotFound')}</p>
        <Link
          href="/dashboard/orders"
          className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('orders.backToOrders')}
        </Link>
      </div>
    )
  }

  return (
    <div className="print:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/orders"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('orders.orderID')} #{order.id}
            </h1>
            <p className="text-gray-600">
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
        </div>
        
        <button
          onClick={handlePrintReceipt}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          {t('orders.printReceipt')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('orders.customerInformation')}</h2>
            <div className="space-y-3">
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
                  <p className="mt-1 text-sm text-gray-700">{order.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('orders.orderItems')}</h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0">
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
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="font-semibold text-lg">{t('orders.totalAmount')}:</span>
              <span className="font-bold text-2xl text-primary-600">
                {format(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">{t('orders.statusHistory')}</h2>
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-3">
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

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('orders.paymentStatus')}</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">{t('orders.status')}:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.paymentStatus === 'CONFIRMED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentStatus === 'PENDING' && (
              <button
                onClick={handleConfirmPayment}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t('orders.confirmPaymentReceived')}
              </button>
            )}
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('orders.orderStatus')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('orders.currentStatus')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'PREPARING' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-100 text-orange-800' :
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('orders.updateStatus')}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PENDING">{t('orders.statuses.pending')}</option>
                  <option value="CONFIRMED">{t('orders.statuses.confirmed')}</option>
                  <option value="PREPARING">{t('orders.statuses.preparing')}</option>
                  <option value="OUT_FOR_DELIVERY">{t('orders.statuses.outForDelivery')}</option>
                  <option value="DELIVERED">{t('orders.statuses.delivered')}</option>
                  <option value="CANCELLED">{t('orders.statuses.cancelled')}</option>
                </select>
              </div>
              
              {selectedStatus !== order.status && (
                <button
                  onClick={handleUpdateStatus}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('orders.updateStatus')} to {selectedStatus}
                </button>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('orders.orderInformation')}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders.orderID')}:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders.currency')}:</span>
                <span className="font-medium">{order.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders.created')}:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders.lastUpdated')}:</span>
                <span className="font-medium">
                  {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}