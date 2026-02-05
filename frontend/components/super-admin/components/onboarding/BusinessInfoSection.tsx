// frontend/components/super-admin/components/onboarding/BusinessInfoSection.tsx
import { BUSINESS_TYPES } from '../../constants/businessTypes'
import { getDisplayDomain } from '@/lib/domain-helper'
import { useState, useEffect } from 'react'

interface BusinessInfoSectionProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function BusinessInfoSection({ formData, onChange }: BusinessInfoSectionProps) {
  // Generate slug preview from business name or use preferred slug
  const getSlugPreview = () => {
    if (formData.preferredSlug) {
      return formData.preferredSlug
    }
    return formData.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'your-business'
  }

  const slugPreview = getSlugPreview()
  // Always show production domain to users
  const displayDomain = getDisplayDomain(slugPreview, true)

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
            <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 whitespace-nowrap">
              .mypadifood.com
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
          
          {/* URL Preview */}
          {(formData.businessName || formData.preferredSlug) && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Your business will be accessible at:</p>
              <p className="text-sm font-medium text-blue-900 break-all">
                https://{displayDomain}
              </p>
            </div>
          )}
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