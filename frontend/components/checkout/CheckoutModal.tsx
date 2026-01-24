// components/checkout/CheckoutModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { X, MessageCircle, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useCurrency } from '@/app/(public)/layout'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
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
      const whatsappMessage = `🛒 *New Order #${order.id}*

👤 *Customer Details:*
Name: ${formData.customerName}
Phone: ${formData.phone}
${formData.email ? `Email: ${formData.email}\n` : ''}${formData.address ? `📍 Address: ${formData.address}\n` : ''}${formData.message ? `💬 Message: ${formData.message}\n` : ''}
🛍️ *Order Items:*
${items.map(item => `• ${item.product.name} x${item.quantity} - ${format(item.product.price * item.quantity)}`).join('\n')}

💰 *Total Amount: ${format(total)}*

📅 Order Date: ${new Date().toLocaleString()}

---
Please confirm this order and let me know the payment details. Thank you! 🙏`

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
        toast.success('Order created! WhatsApp chat opened.')
      }, 1000)

    } catch (err: any) {
      console.error('Checkout error:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create order. Please try again.'
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
    const whatsappMessage = `🛒 *New Order #${orderId}*

👤 *Customer Details:*
Name: ${formData.customerName}
Phone: ${formData.phone}
${formData.email ? `Email: ${formData.email}\n` : ''}${formData.address ? `📍 Address: ${formData.address}\n` : ''}${formData.message ? `💬 Message: ${formData.message}\n` : ''}
🛍️ *Order Items:*
${savedOrderItems.map(item => `• ${item.product.name} x${item.quantity} - ${format(item.product.price * item.quantity)}`).join('\n')}

💰 *Total Amount: ${format(savedTotal)}*

📅 Order Date: ${new Date().toLocaleString()}

---
Please confirm this order and let me know the payment details. Thank you! 🙏`

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
                {success ? 'Order Created!' : 'Complete Your Order'}
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
              ? 'WhatsApp chat has been opened. Complete payment via WhatsApp.'
              : 'Fill in your details and we\'ll open WhatsApp to finalize your order'}
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
                    Order #{orderId} Created Successfully
                  </h3>
                  <p className="text-sm text-green-800">
                    A WhatsApp chat has been opened with the business. Please complete your payment and delivery arrangements via WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Discuss payment method with the seller on WhatsApp</li>
                <li>Complete payment as instructed</li>
                <li>Provide delivery details if needed</li>
                <li>Wait for order confirmation and delivery</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={reopenWhatsApp}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Open WhatsApp Chat Again
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Order ID: #{orderId} • You can track this order using your phone number
            </p>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-semibold mb-3">Order Summary ({items.length} items)</h3>
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
                <span>Total</span>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address (Optional)
                </label>
                <textarea
                  name="address"
                  rows={3}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street, Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message (Optional)
                </label>
                <textarea
                  name="message"
                  rows={2}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any special requests or notes..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> After submitting, a WhatsApp chat will automatically open where you can discuss payment and delivery with the seller.
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
                    Creating Order...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Create Order & Open WhatsApp
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