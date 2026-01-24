// frontend/app/dashboard/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Save, Palette, Globe, Phone, Building, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { SettingsPageSkeleton } from '@/components/ui/LoadingSkeleton'
import BusinessInfoSection from './components/BusinessInfoSection'
import LanguageCurrencySection from './components/LanguageCurrencySection'
import WhatsAppSettingsSection from './components/WhatsAppSettingsSection'
import ThemeSettingsSection from './components/ThemeSettingsSection'
import SocialMediaSection from './components/SocialMediaSection'
import FooterSettingsSection from './components/FooterSettingsSection'
import { COLOR_PRESETS, LANGUAGES, AFRICAN_CURRENCIES } from './constants/settingsConstants'

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

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    const loadingToast = toast.loading('Uploading logo...')
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

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
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings-updated', { 
            detail: data.settings || settings 
          }))
        }
        
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
        <BusinessInfoSection
          settings={settings}
          handleChange={handleChange}
          handleLogoUpload={handleLogoUpload}
          removeLogo={removeLogo}
          uploading={uploading}
        />

        <LanguageCurrencySection
          settings={settings}
          handleChange={handleChange}
          languages={LANGUAGES}
          currencies={AFRICAN_CURRENCIES}
        />

        <WhatsAppSettingsSection
          settings={settings}
          handleChange={handleChange}
        />

        <ThemeSettingsSection
          settings={settings}
          handleChange={handleChange}
          applyColorPreset={applyColorPreset}
          colorPresets={COLOR_PRESETS}
        />

        <SocialMediaSection
          settings={settings}
          handleChange={handleChange}
        />

        <FooterSettingsSection
          settings={settings}
          handleChange={handleChange}
        />

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