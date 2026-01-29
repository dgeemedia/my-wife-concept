// components/checkout/CheckoutModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { X, MessageCircle, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useTranslation } from 'react-i18next'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { t } = useTranslation()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [savedOrderItems, setSavedOrderItems] = useState<any[]>([])
  const [savedTotal, setSavedTotal] = useState(0)
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    message: '',
  })

  const { symbol, format } = useCurrency()

  // Fetch WhatsApp number from settings
  useEffect(() => {
    if (isOpen) {
      fetchWhatsAppNumber()
    }
  }, [isOpen])

  const fetchWhatsAppNumber = async () => {
    try {
      const settings = await api.get('/settings')
      setWhatsappNumber(settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348110252143')
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setWhatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348110252143')
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Prepare order data
      const orderData = {
        ...formData,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }

      // Send order to backend
      const response = await api.post('/orders/checkout', orderData)
      
      // Handle response
      if (!response.success || !response.order) {
        throw new Error('Invalid response from server')
      }

      const order = response.order
      setOrderId(order.id)
      
      // Save order items and total before clearing cart
      setSavedOrderItems([...items])
      setSavedTotal(total)
      
      // Format WhatsApp message
      const whatsappMessage = `${t('whatsapp.newOrder', { orderId: order.id })}

${t('whatsapp.customerDetails')}
${t('whatsapp.name', { name: formData.customerName })}
${t('whatsapp.phone', { phone: formData.phone })}
${formData.email ? `${t('whatsapp.emailLabel', { email: formData.email })}\n` : ''}${formData.address ? `${t('whatsapp.addressLabel', { address: formData.address })}\n` : ''}${formData.message ? `${t('whatsapp.messageLabel', { message: formData.message })}\n` : ''}
${t('whatsapp.orderItems')}
${items.map(item => `• ${item.product.name} x${item.quantity} - ${format(item.product.price * item.quantity)}`).join('\n')}

${t('whatsapp.totalAmount', { total: format(total) })}

${t('whatsapp.orderDate', { date: new Date().toLocaleString() })}

${t('whatsapp.orderConfirmation')}`

      // Auto-open WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      
      // Open WhatsApp in new window
      window.open(whatsappUrl, '_blank')

      // Show success state
      setSuccess(true)
      
      // Clear cart after a delay to allow user to see success message
      setTimeout(() => {
        clearCart()
        toast.success(t('checkout.orderCreatedWhatsAppOpened'))
      }, 1000)

    } catch (err: any) {
      console.error('Checkout error:', err)
      const errorMessage = err.response?.data?.error || err.message || t('checkout.failedToCreateOrder')
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleClose = () => {
    if (success) {
      // Reset form and saved data
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        message: '',
      })
      setSuccess(false)
      setOrderId(null)
      setSavedOrderItems([])
      setSavedTotal(0)
    }
    onClose()
  }

  const reopenWhatsApp = () => {
    // Send the same complete order details using saved data
    const whatsappMessage = `${t('whatsapp.newOrder', { orderId })}

${t('whatsapp.customerDetails')}
${t('whatsapp.name', { name: formData.customerName })}
${t('whatsapp.phone', { phone: formData.phone })}
${formData.email ? `${t('whatsapp.emailLabel', { email: formData.email })}\n` : ''}${formData.address ? `${t('whatsapp.addressLabel', { address: formData.address })}\n` : ''}${formData.message ? `${t('whatsapp.messageLabel', { message: formData.message })}\n` : ''}
${t('whatsapp.orderItems')}
${savedOrderItems.map(item => `• ${item.product.name} x${item.quantity} - ${format(item.product.price * item.quantity)}`).join('\n')}

${t('whatsapp.totalAmount', { total: format(savedTotal) })}

${t('whatsapp.orderDate', { date: new Date().toLocaleString() })}

${t('whatsapp.orderConfirmation')}`

    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <MessageCircle className="w-6 h-6 text-green-600" />
              )}
              <h2 className="text-xl font-bold">
                {success ? t('checkout.orderCreated') : t('checkout.completeOrder')}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {success 
              ? t('checkout.whatsappOpened')
              : t('checkout.fillDetails')}
          </p>
        </div>

        {success ? (
          // Success State
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    {t('checkout.orderCreatedSuccess', { orderId })}
                  </h3>
                  <p className="text-sm text-green-800">
                    {t('checkout.whatsappChatOpened')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">{t('checkout.nextSteps')}</h4>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>{t('checkout.discussPayment')}</li>
                <li>{t('checkout.completePayment')}</li>
                <li>{t('checkout.provideDelivery')}</li>
                <li>{t('checkout.waitConfirmation')}</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={reopenWhatsApp}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t('checkout.openWhatsAppAgain')}
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('checkout.close')}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              {t('checkout.orderIdNote', { orderId })}
            </p>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-semibold mb-3">{t('checkout.orderSummary')} ({items.length} {t('common.items')})</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>{format(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                <span>{t('common.total')}</span>
                <span className="text-primary-600">{format(total)}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.fullName')} {t('checkout.required')}
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder={t('checkout.enterFullName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.phoneNumber')} {t('checkout.required')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('checkout.enterPhoneNumber')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.emailOptional')}
                </label>
                <input
                  type="email"
                  name="email"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('checkout.enterYourEmail')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.deliveryAddressOptional')}
                </label>
                <textarea
                  name="address"
                  rows={3}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('checkout.enterDeliveryAddress')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.additionalMessageOptional')}
                </label>
                <textarea
                  name="message"
                  rows={2}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('checkout.anySpecialRequests')}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>{t('checkout.note')}</strong> {t('checkout.whatsappNote')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('checkout.creatingOrder')}
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    {t('checkout.createOrderWhatsApp')}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}