// components/checkout/CheckoutModal.tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { X, MessageCircle } from 'lucide-react'
import api from '@/lib/api'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    message: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
      
      // Format WhatsApp message
      const whatsappMessage = `*New Order #${response.order.id}*

*Customer Details:*
Name: ${formData.customerName}
Phone: ${formData.phone}
${formData.email ? `Email: ${formData.email}` : ''}
${formData.address ? `Address: ${formData.address}` : ''}
${formData.message ? `Message: ${formData.message}` : ''}

*Order Items:*
${items.map(item => `• ${item.product.name} x${item.quantity} - ₦${(item.product.price * item.quantity).toLocaleString()}`).join('\n')}

*Total: ₦${total.toLocaleString()}*

Order Date: ${new Date().toLocaleString()}`

      // Open WhatsApp
      const whatsappNumber = '2348110252143' // Replace with business WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage)
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')

      // Clear cart and close modal
      clearCart()
      onClose()
      
      // Show success message
      alert('Order sent successfully! Please check WhatsApp for confirmation.')
    } catch (error) {
      alert('Failed to send order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold">Complete Your Order</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Fill in your details and we'll send your order via WhatsApp
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold mb-3">Order Summary ({items.length} items)</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>₦{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
            <span>Total</span>
            <span className="text-primary-600">₦{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="customerName"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.customerName}
              onChange={handleChange}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address (Optional)
            </label>
            <textarea
              name="address"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Message (Optional)
            </label>
            <textarea
              name="message"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Order...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Send Order via WhatsApp
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}