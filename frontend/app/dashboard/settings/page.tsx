// frontend/app/dashboard/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Save, Palette, Globe, Phone, Building, Upload, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { SettingsPageSkeleton } from '@/components/ui/LoadingSkeleton'

const COLOR_PRESETS = [
  { name: 'Green', primary: '#10B981', secondary: '#F59E0B' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#8B5CF6' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#EC4899' },
  { name: 'Red', primary: '#EF4444', secondary: '#F59E0B' },
  { name: 'Orange', primary: '#F97316', secondary: '#EAB308' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#06B6D4' },
]

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState({
    id: 0,
    businessName: '',
    businessType: 'food',
    businessMotto: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    logo: '',
    primaryColor: '#10B981',
    secondaryColor: '#F59E0B',
    currency: 'NGN',
    language: 'en',
    whatsappNumber: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    footerText: '',
    footerCopyright: '',
    footerAddress: '',
    footerEmail: '',
    footerPhone: '',
    createdAt: '',
    updatedAt: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      // Use the API route to ensure fresh data
      const response = await fetch('/api/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB to match backend)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    const loadingToast = toast.loading('Uploading logo...')
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      // Make request - cookie will be sent automatically
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include', // Important: Include cookies in request
        body: formData,
      })

      // Check content type before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned invalid response. Please check backend logs.')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status}`)
      }
      
      if (data.ok && data.imageUrl) {
        setSettings(prev => ({ ...prev, logo: data.imageUrl }))
        toast.success('Logo uploaded successfully', { id: loadingToast })
      } else {
        throw new Error(data.error || 'Upload failed - no image URL returned')
      }
    } catch (error: any) {
      console.error('Logo upload failed:', error)
      toast.error(error.message || 'Failed to upload logo', { id: loadingToast })
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = () => {
    setSettings(prev => ({ ...prev, logo: '' }))
    toast.success('Logo removed. Click Save to apply changes.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const loadingToast = toast.loading('Saving settings...')

    try {
      // Validate required fields
      if (!settings.businessName.trim()) {
        throw new Error('Business name is required')
      }
      if (!settings.phone.trim()) {
        throw new Error('Phone number is required')
      }
      if (!settings.whatsappNumber.trim()) {
        throw new Error('WhatsApp number is required')
      }

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      const data = await response.json()
      
      if (data.ok || data.settings) {
        toast.success('Settings saved successfully!', { id: loadingToast })
        
        // Broadcast settings change to other tabs/windows
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings-updated', { detail: data.settings || settings }))
        }
        
        // Reload after a short delay to allow toast to show
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error('Save operation returned unexpected response')
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error)
      toast.error(error.message || 'Failed to save settings', { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }))
    toast.success(`${preset.name} theme applied. Click Save to persist changes.`)
  }

      if (loading) {
        return <SettingsPageSkeleton />
      }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600">Configure your business information and appearance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
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

        {/* Language & Currency */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Language & Currency</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language *
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                This will affect text on your landing page
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="EUR">Euro (€)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                This will affect all product prices
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-6">
            <Phone className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold">WhatsApp Settings</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number *
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

        {/* Theme Settings */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-6">
            <Palette className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold">Theme Settings</h2>
          </div>
          
          {/* Color Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Color Themes
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyColorPreset(preset)}
                  className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="w-12 h-12 cursor-pointer rounded"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Used for buttons, links, and highlights
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                  className="w-12 h-12 cursor-pointer rounded"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Used for accents and secondary elements
              </p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Social Media Links</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={settings.facebookUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={settings.instagramUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X (Twitter) URL
              </label>
              <input
                type="url"
                name="twitterUrl"
                value={settings.twitterUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://x.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={settings.linkedinUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/company/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok URL
              </label>
              <input
                type="url"
                name="tiktokUrl"
                value={settings.tiktokUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://tiktok.com/@yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                value={settings.youtubeUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://youtube.com/@yourpage"
              />
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Footer Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
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
                Copyright Text
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
                Footer Phone
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
                Footer Email
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
                Footer Address
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

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Reset Changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}