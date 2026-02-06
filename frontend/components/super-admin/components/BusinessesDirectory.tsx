// frontend/components/super-admin/components/BusinessesDirectory.tsx
'use client'

import { useState, useEffect } from 'react'
import { Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BusinessCard from './BusinessCard'
import BusinessTypeFilter from './BusinessTypeFilter'
import { BUSINESS_TYPES } from '../constants/businessTypes'
import type { Business } from '../types'

export default function BusinessesDirectory() {
  const { t } = useTranslation('landing')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/onboarding/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = selectedType === 'all' 
    ? businesses 
    : businesses.filter(b => b.businessType === selectedType)

  const businessTypeCounts = businesses.reduce((acc, business) => {
    acc[business.businessType] = (acc[business.businessType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('businessDirectory.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('businessDirectory.subtitle')}
          </p>
        </div>

        <BusinessTypeFilter
          selectedType={selectedType}
          onSelectType={setSelectedType}
          counts={businessTypeCounts}
          totalCount={businesses.length}
        />

        {loading ? (
          <BusinessesSkeleton />
        ) : filteredBusinesses.length === 0 ? (
          <EmptyBusinessesState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BusinessesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

function EmptyBusinessesState() {
  const { t } = useTranslation('landing')
  
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
        <Store className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {t('businessDirectory.noBusinesses')}
      </h3>
      <p className="text-gray-600">{t('businessDirectory.tryDifferent')}</p>
    </div>
  )
}