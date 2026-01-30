// frontend/app/dashboard/settings/components/FooterSettingsSection.tsx
import { useTranslation } from 'react-i18next'

interface FooterSettingsSectionProps {
  settings: any
  handleChange: (e: any) => void
}

export default function FooterSettingsSection({
  settings,
  handleChange
}: FooterSettingsSectionProps) {
  const { t } = useTranslation('dashboard')
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-6">{t('settings.footer')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.footerText')}
          </label>
          <textarea
            name="footerText"
            value={settings.footerText}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="About your business..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.footerCopyright')}
          </label>
          <input
            type="text"
            name="footerCopyright"
            value={settings.footerCopyright}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`© ${new Date().getFullYear()} All rights reserved.`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.footerPhone')}
          </label>
          <input
            type="tel"
            name="footerPhone"
            value={settings.footerPhone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.footerEmail')}
          </label>
          <input
            type="email"
            name="footerEmail"
            value={settings.footerEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.footerAddress')}
          </label>
          <textarea
            name="footerAddress"
            value={settings.footerAddress}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}