// frontend/components/super-admin/components/BusinessTypeFilter.tsx
import { BUSINESS_TYPES } from '../constants/businessTypes'

interface BusinessTypeFilterProps {
  selectedType: string
  onTypeSelect: (type: string) => void
}

export default function BusinessTypeFilter({ selectedType, onTypeSelect }: BusinessTypeFilterProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
      <button
        onClick={() => onTypeSelect('all')}
        className={`px-6 py-2 rounded-lg font-medium transition-all ${
          selectedType === 'all'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        All
      </button>
      {Object.entries(BUSINESS_TYPES).map(([type, info]) => (
        <button
          key={type}
          onClick={() => onTypeSelect(type)}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            selectedType === type
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="mr-1">{info.icon}</span>
          {info.label}
        </button>
      ))}
    </div>
  )
}