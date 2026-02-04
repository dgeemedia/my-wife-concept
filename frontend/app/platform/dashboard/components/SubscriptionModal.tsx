// frontend/app/platform/dashboard/components/SubscriptionModal.tsx
'use client'

import { useState } from 'react'
import { X, Calendar, CreditCard, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Business {
  id: number
  businessName: string
  slug: string
  subscriptionPlan?: string
  subscriptionExpiry?: string
  subscriptionStartDate?: string
  trialEndsAt?: string
  isActive: boolean
}

interface SubscriptionModalProps {
  business: Business
  onClose: () => void
  onSuccess: () => void
}

export default function SubscriptionModal({ business, onClose, onSuccess }: SubscriptionModalProps) {
  const [plan, setPlan] = useState<'monthly' | 'annual' | 'none'>('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [customExpiry, setCustomExpiry] = useState('')
  const [useCustomExpiry, setUseCustomExpiry] = useState(false)
  const [notes, setNotes] = useState('')
  const [activateBusiness, setActivateBusiness] = useState(true)
  const [loading, setLoading] = useState(false)

  const calculateExpiry = () => {
    if (useCustomExpiry && customExpiry) {
      return new Date(customExpiry).toLocaleDateString()
    }

    const start = new Date(startDate)
    const expiry = new Date(start)
    
    if (plan === 'monthly') {
      expiry.setDate(expiry.getDate() + 30)
    } else if (plan === 'annual') {
      expiry.setDate(expiry.getDate() + 365)
    }
    
    return plan === 'none' ? 'N/A' : expiry.toLocaleDateString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/business/${business.id}/update-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan,
          startDate: plan !== 'none' ? startDate : undefined,
          customExpiryDate: useCustomExpiry && customExpiry ? customExpiry : undefined,
          notes,
          activateBusiness
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Subscription updated successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to update subscription')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Update Subscription</h2>
            <p className="text-sm text-gray-600 mt-1">{business.businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Current Status</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Plan: <span className="font-medium">{business.subscriptionPlan || 'none'}</span></div>
              {business.subscriptionExpiry && (
                <div>Expires: <span className="font-medium">
                  {new Date(business.subscriptionExpiry).toLocaleDateString()}
                </span></div>
              )}
              {business.trialEndsAt && (
                <div>Trial Ends: <span className="font-medium">
                  {new Date(business.trialEndsAt).toLocaleDateString()}
                </span></div>
              )}
              <div>Status: <span className={`font-medium ${business.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {business.isActive ? 'Active' : 'Suspended'}
              </span></div>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Subscription Plan *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPlan('monthly')}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  plan === 'monthly'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                  plan === 'monthly' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-semibold text-gray-900">Monthly</div>
                <div className="text-xs text-gray-500 mt-1">30 days</div>
              </button>

              <button
                type="button"
                onClick={() => setPlan('annual')}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  plan === 'annual'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                  plan === 'annual' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <div className="font-semibold text-gray-900">Annual</div>
                <div className="text-xs text-gray-500 mt-1">365 days</div>
              </button>

              <button
                type="button"
                onClick={() => setPlan('none')}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  plan === 'none'
                    ? 'border-gray-600 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <X className={`w-6 h-6 mx-auto mb-2 ${
                  plan === 'none' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <div className="font-semibold text-gray-900">None</div>
                <div className="text-xs text-gray-500 mt-1">Clear subscription</div>
              </button>
            </div>
          </div>

          {plan !== 'none' && (
            <>
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Custom Expiry Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="customExpiry"
                  checked={useCustomExpiry}
                  onChange={(e) => setUseCustomExpiry(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="customExpiry" className="text-sm text-gray-700">
                  Set custom expiry date
                </label>
              </div>

              {/* Custom Expiry Date */}
              {useCustomExpiry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Expiry Date
                  </label>
                  <input
                    type="date"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={useCustomExpiry}
                  />
                </div>
              )}

              {/* Calculated Expiry Display */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-900">Subscription will expire on:</div>
                  <div className="text-lg font-bold text-green-700 mt-1">{calculateExpiry()}</div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this subscription update..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Activate Business Option */}
          {!business.isActive && plan !== 'none' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-900 mb-2">
                    This business is currently suspended
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activateBusiness}
                      onChange={(e) => setActivateBusiness(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-yellow-700">
                      Reactivate business when subscription is updated
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Subscription</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}