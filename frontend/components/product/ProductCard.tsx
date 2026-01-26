// ============================================================================
// COMBINED BEST VERSION - Multi-Image Gallery + View All Reviews Button
// frontend/components/product/ProductCard.tsx
// ============================================================================

'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/components/cart/CartProvider'
import { useCurrency } from '@/app/(public)/layout'
import { ShoppingCart, Star, Eye } from 'lucide-react'
import ProductRatingModal from './ProductRatingModal'
import ProductReviewsModal from './ProductReviewsModal'
import ImageGallery from './ImageGallery'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { symbol } = useCurrency()
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  // Prepare images array for multi-image gallery
  const productImages = product.images && product.images.length > 0
    ? product.images.sort((a, b) => a.order - b.order)
    : product.imageUrl 
      ? [{ id: 0, imageUrl: product.imageUrl, order: 0 }]
      : []

  return (
    <>
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Product Image Gallery - Multi-image support with auto-rotation */}
        <div className="relative">
          <ImageGallery 
            images={productImages}
            productName={product.name}
            autoRotate={true}
            rotateInterval={3000}
          />
          
          {/* Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              Out of Stock
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              Low Stock: {product.stock}
            </div>
          )}
          
          {/* Quick Add Button */}
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg transition-all z-10 ${
              isOutOfStock
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 transform hover:scale-110'
            }`}
          >
            <ShoppingCart className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
              {product.name}
            </h3>
            <span 
              className="font-bold text-xl flex-shrink-0 ml-2"
              style={{ color: 'var(--color-primary, #10B981)' }}
            >
              {symbol}{product.price.toLocaleString()}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description || 'No description available'}
          </p>

          {/* Rating Display with View All Reviews Button */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      product.averageRating && star <= Math.round(product.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              {product.totalRatings && product.totalRatings > 0 ? (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.averageRating?.toFixed(1)} ({product.totalRatings})
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No ratings yet</span>
              )}
            </div>
            
            {/* View All Reviews Button - Shows if there are ratings */}
            {product.totalRatings && product.totalRatings > 0 && (
              <button
                onClick={() => setShowReviewsModal(true)}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View all reviews
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              title="Rate this product"
            >
              <Star className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <ProductRatingModal
          productId={product.id}
          productName={product.name}
          onClose={() => setShowRatingModal(false)}
        />
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
        <ProductReviewsModal
          productId={product.id}
          productName={product.name}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
    </>
  )
}