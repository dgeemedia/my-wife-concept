// frontend/components/super-admin/components/HeroSection.tsx
'use client'

import { Building2, Store, MessageCircle } from 'lucide-react'
import FeatureCard from './FeatureCard'

interface HeroSectionProps {
  setActiveView: (view: 'businesses' | 'onboarding') => void
}

export default function HeroSection({ setActiveView }: HeroSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to MyPadiFood
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your one-stop platform for multiple businesses. Browse our stores, or start your own business with us today.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
        <button
          onClick={() => setActiveView('businesses')}
          className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <Store className="w-6 h-6 mr-2" />
          Browse Businesses
        </button>
        <button
          onClick={() => setActiveView('onboarding')}
          className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <Building2 className="w-6 h-6 mr-2" />
          Start Your Business
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Building2 className="w-12 h-12 text-blue-600" />}
          title="Multiple Businesses"
          description="Discover various businesses all in one platform. From food to services, find what you need."
        />
        <FeatureCard
          icon={<Store className="w-12 h-12 text-green-600" />}
          title="Easy Onboarding"
          description="Start your business in minutes. Fill a simple form and our team will set you up."
        />
        <FeatureCard
          icon={<MessageCircle className="w-12 h-12 text-purple-600" />}
          title="24/7 Support"
          description="Get instant support through WhatsApp. Our team is always ready to help."
        />
      </div>
    </div>
  )
}