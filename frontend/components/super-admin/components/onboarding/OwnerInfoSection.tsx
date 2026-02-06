// frontend/components/super-admin/components/onboarding/OwnerInfoSection.tsx
import { useTranslation } from 'react-i18next'

interface OwnerInfoSectionProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function OwnerInfoSection({ formData, onChange }: OwnerInfoSectionProps) {
  const { t } = useTranslation('landing')

  return (
    <div className="pt-6 border-t">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('onboarding.ownerInfo.title')}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('onboarding.ownerInfo.fullName')} *
          </label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={onChange}
            required
            placeholder={t('onboarding.ownerInfo.fullNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('onboarding.ownerInfo.email')} *
            </label>
            <input
              type="email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={onChange}
              required
              placeholder={t('onboarding.ownerInfo.emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('onboarding.ownerInfo.phone')} *
            </label>
            <input
              type="tel"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={onChange}
              required
              placeholder={t('onboarding.ownerInfo.phonePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}