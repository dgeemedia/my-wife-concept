// frontend/components/product/ProductGrid.tsx
'use client'

import { Product } from '@/types'
import ProductCard from './ProductCard'
import { useTranslation } from 'react-i18next'

interface ProductGridProps {
  products: Product[]
  columns?: number
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const { t } = useTranslation()
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  const colClass = gridCols[columns as keyof typeof gridCols] || gridCols[4]

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('product.noProductsFound')}</h3>
        <p className="text-gray-500">{t('product.checkBackLater')}</p>
      </div>
    )
  }

  return (
    <div className={`grid ${colClass} gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}