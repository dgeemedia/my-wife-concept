// frontend/components/super-admin/components/BusinessCard.tsx
import { ExternalLink } from 'lucide-react'
import { BUSINESS_TYPES } from '../constants/businessTypes'
import { getBusinessUrl, getDisplayDomain } from '@/lib/domain-helper'
import { useTranslation } from 'react-i18next'
import type { Business } from '../types'

interface BusinessCardProps {
  business: Business
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { t } = useTranslation('landing')
  const businessInfo = BUSINESS_TYPES[business.businessType as keyof typeof BUSINESS_TYPES] || BUSINESS_TYPES.other
  
  const displayDomain = getDisplayDomain(business.slug, true)
  const businessUrl = getBusinessUrl(business.slug)
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
      <div className={`h-48 bg-gradient-to-br ${businessInfo.color} flex items-center justify-center relative overflow-hidden`}>
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl">{businessInfo.icon}</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{business.businessName}</h3>
            <span className="text-sm text-gray-500">{businessInfo.label}</span>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {business._count?.products || 0} {t('businessCard.products')}
          </span>
        </div>
        
        {business.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>
        )}
        
        <div className="mb-3 text-sm text-gray-500 flex items-center">
          <span className="truncate">{displayDomain}</span>
        </div>
        
        <a
          href={businessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('businessCard.visitStore')}
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  )
}