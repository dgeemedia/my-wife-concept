// app/(public)/track/page.tsx
'use client'

import { useState } from 'react'
import { Search, Package, Clock, CheckCircle, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function TrackOrderPage() {
  const { t } = useTranslation()
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !phone) {
      setError(t('order.enterOrderIdAndPhone'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/track/${orderId}?phone=${phone}`
      )
      const data = await response.json()

      if (data.success) {
        setOrder(data.order)
      } else {
        setError(data.error || t('order.orderNotFound'))
      }
    } catch {
      setError(t('order.failedToTrack'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'CONFIRMED':
        return <CheckCircle className="w-6 h-6 text-blue-500" />
      case 'PREPARING':
        return <Package className="w-6 h-6 text-orange-500" />
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-6 h-6 text-purple-500" />
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800'
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('order.trackYourOrder')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('order.enterOrderId')}
          </p>
        </div>

        {/* Track Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('order.orderId')}
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder={t('order.enterOrderIdPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('order.phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('order.enterPhoneNumberPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('order.tracking')}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  {t('order.trackOrder')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('order.orderNumber')} #{order.id}
                </h2>
                <p className="text-gray-600">
                  {t('order.placedOn', { date: new Date(order.createdAt).toLocaleDateString() })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
                <span className="font-semibold">{order.status}</span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-6">{t('order.orderStatus')}</h3>
              <div className="space-y-6">
                {order.statusHistory?.map((history: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(history.status)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">
                          {history.status}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{t('order.orderItems')}</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {item.product?.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{item.product?.name}</h4>
                        <p className="text-sm text-gray-500">
                          {t('order.quantity')}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="font-semibold">
                      ₦{(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order.subtotal')}</span>
                  <span>₦{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order.delivery')}</span>
                  <span>₦0</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>{t('order.total')}</span>
                  <span className="text-primary-600">
                    ₦{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}