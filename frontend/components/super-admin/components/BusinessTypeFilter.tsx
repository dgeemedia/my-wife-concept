// frontend/components/super-admin/components/BusinessTypeFilter.tsx
import { useTranslation } from 'react-i18next'
import { BUSINESS_TYPES } from '../constants/businessTypes'

interface BusinessTypeFilterProps {
  selectedType: string
  onSelectType: (type: string) => void
  counts: Record<string, number>
  totalCount: number
}

export default function BusinessTypeFilter({ 
  selectedType, 
  onSelectType, 
  counts,
  totalCount 
}: BusinessTypeFilterProps) {
  const { t } = useTranslation('landing')
  
  const popularTypes = ['all', 'food', 'restaurant', 'farming', 'agriculture', 'retail', 'fashion']
  const otherTypes = Object.keys(BUSINESS_TYPES)
    .filter(type => !popularTypes.includes(type) && counts[type] > 0)
    .sort()

  const displayTypes = ['all', ...popularTypes.slice(1), ...otherTypes]

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 justify-center">
        {displayTypes.map(type => {
          const count = type === 'all' ? totalCount : (counts[type] || 0)
          if (count === 0 && type !== 'all') return null

          const businessInfo = type === 'all' 
            ? { label: t('businessFilter.allBusinesses'), icon: '🏪' }
            : BUSINESS_TYPES[type as keyof typeof BUSINESS_TYPES]

          return (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedType === type
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }
              `}
            >
              <span className="mr-2">{businessInfo.icon}</span>
              {businessInfo.label}
              <span className={`ml-2 text-sm ${selectedType === type ? 'text-blue-100' : 'text-gray-500'}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}