// frontend/app/dashboard/settings/components/WhatsAppSettingsSection.tsx
import { Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface WhatsAppSettingsSectionProps {
  settings: any
  handleChange: (e: any) => void
}

export default function WhatsAppSettingsSection({
  settings,
  handleChange
}: WhatsAppSettingsSectionProps) {
  const { t } = useTranslation('dashboard')
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center mb-6">
        <Phone className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-lg font-semibold">{t('settings.whatsapp')}</h2>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.whatsappNumber')} *
        </label>
        <input
          type="tel"
          name="whatsappNumber"
          value={settings.whatsappNumber}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="2348110252143"
        />
        <p className="text-sm text-gray-500 mt-1">
          Customer orders will be sent to this WhatsApp number
        </p>
      </div>
    </div>
  )
}