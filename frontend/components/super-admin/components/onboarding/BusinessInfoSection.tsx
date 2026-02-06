// frontend/components/super-admin/components/onboarding/BusinessInfoSection.tsx
import { BUSINESS_TYPES } from '../../constants/businessTypes'
import { getDisplayDomain } from '@/lib/domain-helper'
import { useTranslation } from 'react-i18next'

interface BusinessInfoSectionProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function BusinessInfoSection({ formData, onChange }: BusinessInfoSectionProps) {
  const { t } = useTranslation('landing')

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
  const displayDomain = getDisplayDomain(slugPreview, true)

  // Group business types by category
  const businessCategories = {
    [t('onboarding.categories.foodDining')]: ['food', 'restaurant', 'bakery', 'cafe', 'fastfood', 'catering'],
    [t('onboarding.categories.agricultureFarming')]: ['farming', 'agriculture', 'livestock', 'fishery', 'dairy', 'organic'],
    [t('onboarding.categories.hospitality')]: ['hotel', 'shortlet'],
    [t('onboarding.categories.retailShopping')]: ['retail', 'supermarket', 'fashion', 'boutique', 'jewelry', 'toys', 'pets'],
    [t('onboarding.categories.technologyElectronics')]: ['electronics', 'phones', 'computers', 'software', 'telecommunications'],
    [t('onboarding.categories.healthBeauty')]: ['beauty', 'pharmacy', 'gym', 'spa', 'clinic', 'dental'],
    [t('onboarding.categories.homeLiving')]: ['furniture', 'realestate', 'construction', 'plumbing', 'electrical', 'cleaning', 'florist'],
    [t('onboarding.categories.automotive')]: ['automotive', 'carwash'],
    [t('onboarding.categories.educationLearning')]: ['education', 'bookstore', 'daycare'],
    [t('onboarding.categories.sportsRecreation')]: ['sports', 'entertainment'],
    [t('onboarding.categories.professionalServices')]: ['services', 'consulting', 'legal', 'accounting', 'events', 'photography'],
    [t('onboarding.categories.otherServices')]: ['laundry', 'logistics', 'printing', 'artcraft']
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('onboarding.businessInfo.title')}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('onboarding.businessInfo.businessName')} *
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={onChange}
            required
            placeholder={t('onboarding.businessInfo.businessNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('onboarding.businessInfo.businessType')} *
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(businessCategories).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map(type => {
                  const businessInfo = BUSINESS_TYPES[type as keyof typeof BUSINESS_TYPES]
                  return (
                    <option key={type} value={type}>
                      {businessInfo.icon} {businessInfo.label}
                    </option>
                  )
                })}
              </optgroup>
            ))}
            <option value="other">💼 {t('onboarding.businessInfo.other')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('onboarding.businessInfo.preferredSlug')}
          </label>
          <div className="flex items-center">
            <input
              type="text"
              name="preferredSlug"
              value={formData.preferredSlug}
              onChange={onChange}
              pattern="[a-z0-9-]+"
              placeholder={t('onboarding.businessInfo.slugPlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 whitespace-nowrap">
              .mypadifood.com
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t('onboarding.businessInfo.slugHint')}
          </p>
          
          {/* URL Preview */}
          {(formData.businessName || formData.preferredSlug) && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">
                {t('onboarding.businessInfo.urlPreviewLabel')}
              </p>
              <p className="text-sm font-medium text-blue-900 break-all">
                https://{displayDomain}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('onboarding.businessInfo.description')}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={3}
            placeholder={t('onboarding.businessInfo.descriptionPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}