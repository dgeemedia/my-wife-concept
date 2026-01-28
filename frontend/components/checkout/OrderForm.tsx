// frontend/components/checkout/OrderForm.tsx
'use client'

import { useState } from 'react'
import { User, Phone, Mail, MapPin, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface OrderFormProps {
  initialData?: {
    customerName: string
    phone: string
    email: string
    address: string
    message: string
  }
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

export default function OrderForm({ initialData, onSubmit, loading = false }: OrderFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    message: initialData?.message || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Full Name *
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email (Optional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Delivery Address (Optional)
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter delivery address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="inline w-4 h-4 mr-1" />
          Additional Message (Optional)
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any special instructions or notes..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  )
}