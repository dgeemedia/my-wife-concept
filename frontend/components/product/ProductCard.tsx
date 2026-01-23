// frontend/components/product/ProductCard.tsx
'use client'

import { Product } from '@/types'
import { useCart } from '@/components/cart/CartProvider'
import { useCurrency } from '@/app/(public)/layout'
import { ShoppingCart, Star } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { symbol } = useCurrency()

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
        
        {/* Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Out of Stock
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Low Stock: {product.stock}
          </div>
        )}
        
        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
          className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg transition-all ${
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
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <span 
            className="font-bold text-xl"
            style={{ color: 'var(--color-primary, #10B981)' }}
          >
            {symbol}{product.price.toLocaleString()}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        {/* Rating and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">(4.8)</span>
          </div>
          
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}