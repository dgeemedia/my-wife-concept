// frontend/components/product/ProductRatingModal.tsx
'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle, X } from 'lucide-react'

interface ProductRatingModalProps {
  productId: number
  productName: string
  onClose: () => void
}

export default function ProductRatingModal({ productId, productName, onClose }: ProductRatingModalProps) {
  const [phone, setPhone] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [canRate, setCanRate] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const checkEligibility = async () => {
    if (!phone || phone.length < 10) return
    
    setChecking(true)
    try {
      const response = await fetch(
        `/api/ratings?action=check&productId=${productId}&phone=${encodeURIComponent(phone)}`
      )
      const data = await response.json()
      
      if (data.success) {
        setCanRate(data.canRate)
        setHasRated(data.hasRated)
        if (data.rating) {
          setRating(data.rating.rating)
          setComment(data.rating.comment || '')
        }
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async () => {
    if (!phone || rating === 0) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, phone, rating, comment })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        alert(data.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
          disabled={!interactive}
        >
          <Star
            className={`w-8 h-8 ${
              star <= (interactive && hoverRating ? hoverRating : rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rate Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1 dark:text-white">{productName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share your experience with this product</p>
          </div>

          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Thank you for your rating!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Your feedback helps us improve.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={checkEligibility}
                  placeholder="08012345678"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {checking && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Checking eligibility...</p>
                )}
                {!canRate && phone.length >= 10 && !checking && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    ⚠️ You can only rate products you've purchased and received
                  </p>
                )}
                {hasRated && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    ℹ️ You're updating your previous rating
                  </p>
                )}
              </div>

              {canRate && (
                <>
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Your Rating
                    </label>
                    <div className="flex justify-center">
                      <StarRating interactive={true} />
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {rating} star{rating !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Tell us about your experience with this product..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {hasRated ? 'Update Rating' : 'Submit Rating'}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}