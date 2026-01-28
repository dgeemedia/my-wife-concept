// frontend/components/cart/CartItem.tsx
'use client'

import { Product } from '@/types'
import { Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useTranslation } from 'react-i18next'

interface CartItemProps {
  item: {
    product: Product
    quantity: number
  }
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { t } = useTranslation()
  const { product, quantity } = item
  const total = product.price * quantity
  const { format } = useCurrency()

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-1 bg-gray-200 rounded"></div>
              <p className="text-xs">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
        <p className="text-sm text-gray-500 mb-2">{format(product.price)} each</p>
        
        {/* Stock Status */}
        {product.stock < quantity && (
          <p className="text-sm text-red-600 mb-2">
            Only {product.stock} left in stock
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={quantity >= product.stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Price */}
        <div className="w-24 text-right">
          <p className="font-semibold">{format(total)}</p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(product.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}