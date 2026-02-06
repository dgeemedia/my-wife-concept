// frontend/components/super-admin/components/OnboardingForm.tsx
'use client'

import { useState } from 'react'
import { Send, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import BusinessInfoSection from './onboarding/BusinessInfoSection'
import OwnerInfoSection from './onboarding/OwnerInfoSection'
import type { OnboardingFormData } from '../types'

export default function OnboardingForm() {
  const { t } = useTranslation('landing')
  const [formData, setFormData] = useState<OnboardingFormData>({
    businessName: '',
    businessType: 'food',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    description: '',
    preferredSlug: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || t('onboarding.submitSuccess'))
        setSubmitted(true)
      } else {
        throw new Error(data.error || t('onboarding.submitError'))
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (submitted) {
    return <SuccessScreen onReset={() => setSubmitted(false)} />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {t('onboarding.title')}
        </h2>
        <p className="text-xl text-gray-600">
          {t('onboarding.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <BusinessInfoSection formData={formData} onChange={handleChange} />
        <OwnerInfoSection formData={formData} onChange={handleChange} />

        <SubmitButton submitting={submitting} />
      </form>
    </div>
  )
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation('landing')
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('onboarding.successTitle')}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {t('onboarding.successMessage')}
        </p>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('onboarding.submitAnother')}
        </button>
      </div>
    </div>
  )
}

function SubmitButton({ submitting }: { submitting: boolean }) {
  const { t } = useTranslation('landing')
  
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {submitting ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          {t('onboarding.submitting')}
        </>
      ) : (
        <>
          <Send className="w-5 h-5 mr-2" />
          {t('onboarding.submitButton')}
        </>
      )}
    </button>
  )
}