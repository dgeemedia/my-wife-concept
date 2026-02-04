// frontend/components/super-admin/components/BusinessesDirectory.tsx
'use client'

import { useState, useEffect } from 'react'
import { Store } from 'lucide-react'
import BusinessCard from './BusinessCard'
import BusinessTypeFilter from './BusinessTypeFilter'
import { BUSINESS_TYPES } from '../constants/businessTypes'
import type { Business } from '../types'

export default function BusinessesDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Businesses</h2>
        <p className="text-xl text-gray-600">
          Discover amazing local businesses on our platform
        </p>
      </div>

      {/* Filter */}
      <BusinessTypeFilter selectedType={selectedType} onTypeSelect={setSelectedType} />

      {/* Businesses Grid */}
      {loading ? (
        <BusinessesSkeleton />
      ) : filteredBusinesses.length === 0 ? (
        <EmptyBusinessesState />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  )
}

function BusinessesSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

function EmptyBusinessesState() {
  return (
    <div className="text-center py-12">
      <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-600">No businesses found in this category</p>
    </div>
  )
}