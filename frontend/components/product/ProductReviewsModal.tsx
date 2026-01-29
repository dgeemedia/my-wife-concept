// frontend/components/product/ProductReviewsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Star, X, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProductReviewsModalProps {
  productId: number
  productName: string
  onClose: () => void
}

interface Rating {
  rating: number
  comment: string | null
  createdAt: string
  phone: string
}

export default function ProductReviewsModal({ productId, productName, onClose }: ProductReviewsModalProps) {
  const { t } = useTranslation()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  useEffect(() => {
    fetchRatings()
  }, [productId])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?productId=${productId}&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        setRatings(data.ratings || [])
        setAverageRating(data.averageRating || 0)
        setTotalRatings(data.totalRatings || 0)
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('rating.today')
    if (diffDays === 1) return t('rating.yesterday')
    if (diffDays < 7) return t('rating.daysAgo', { days: diffDays })
    if (diffDays < 30) return t('rating.weeksAgo', { weeks: Math.floor(diffDays / 7) })
    if (diffDays < 365) return t('rating.monthsAgo', { months: Math.floor(diffDays / 30) })
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('rating.customerReviews')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </div>
              <StarDisplay rating={Math.round(averageRating)} />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalRatings} {totalRatings === 1 ? t('rating.review') : t('rating.reviews')}
              </div>
            </div>
            
            {/* Rating Breakdown */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratings.filter(r => r.rating === stars).length
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                
                return (
                  <div key={stars} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {stars}★
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('rating.noReviewsYet')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('rating.beFirstToReview')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((review, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.phone.slice(-2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {t('rating.customer')} {review.phone}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <StarDisplay rating={review.rating} />
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('checkout.close')}
          </button>
        </div>
      </div>
    </div>
  )
}