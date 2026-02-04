// frontend/components/super-admin/components/onboarding/BusinessInfoSection.tsx
import { BUSINESS_TYPES } from '../../constants/businessTypes'

interface BusinessInfoSectionProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function BusinessInfoSection({ formData, onChange }: BusinessInfoSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={onChange}
            required
            placeholder="e.g., Fresh Farm Produce"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(BUSINESS_TYPES).map(([type, info]) => (
              <option key={type} value={type}>
                {info.icon} {info.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred URL Slug
          </label>
          <div className="flex items-center">
            <input
              type="text"
              name="preferredSlug"
              value={formData.preferredSlug}
              onChange={onChange}
              pattern="[a-z0-9-]+"
              placeholder="freshfarm"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
              .localhost:3000
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={3}
            placeholder="Tell us about your business..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}