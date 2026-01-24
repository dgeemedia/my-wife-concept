// frontend/app/dashboard/settings/components/BusinessInfoSection.tsx
import { Building, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface BusinessInfoSectionProps {
  settings: any
  handleChange: (e: any) => void
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeLogo: () => void
  uploading: boolean
}

export default function BusinessInfoSection({
  settings,
  handleChange,
  handleLogoUpload,
  removeLogo,
  uploading
}: BusinessInfoSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center mb-6">
        <Building className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Business Information</h2>
      </div>
      
      {/* Logo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Logo
        </label>
        <div className="flex items-center gap-4">
          {settings.logo ? (
            <div className="relative">
              <Image
                src={settings.logo}
                alt="Business Logo"
                width={120}
                height={120}
                className="rounded-lg object-contain border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : settings.logo ? 'Change Logo' : 'Upload Logo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Recommended: 200x200px, max 2MB
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            name="businessName"
            value={settings.businessName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Motto
          </label>
          <input
            type="text"
            name="businessMotto"
            value={settings.businessMotto || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your business tagline or motto"
          />
          <p className="text-sm text-gray-500 mt-1">
            This will appear under your business name in the footer
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          <select
            name="businessType"
            value={settings.businessType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="food">Food & Restaurant</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="general">General Store</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={settings.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={settings.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={settings.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your business..."
          />
        </div>
      </div>
    </div>
  )
}