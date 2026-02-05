// frontend/components/super-admin/components/HeroSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Globe, 
  Languages, 
  DollarSign, 
  MessageCircle,
  Star,
  Zap,
  ArrowRight,
  Smartphone,
  ShoppingBag,
  Home,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  Users,
  CheckCircle,
  TrendingUp 
} from 'lucide-react'

interface HeroSectionProps {
  setActiveView: (view: 'businesses' | 'onboarding') => void
}

export default function HeroSection({ setActiveView }: HeroSectionProps) {
  const [animate, setAnimate] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [currentLanguage, setCurrentLanguage] = useState('English')
  const [currentCurrency, setCurrentCurrency] = useState('USD')
  const [email, setEmail] = useState('')
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    setAnimate(true)
    
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      if (isPlaying) {
        setCurrentTestimonial((prev) => (prev + 1) % 3)
      }
    }, 5000)
    
    return () => clearInterval(testimonialInterval)
  }, [isPlaying])

  const handleQuickStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setActiveView('onboarding')
      localStorage.setItem('prefill_email', email)
    }
  }

  const testimonials = [
    {
      name: 'Christiana Isola',
      business: 'Chrenis Farm',
      industry: 'Agriculture',
      avatarColor: 'bg-green-100',
      icon: <ShoppingBag className="w-6 h-6 text-green-600" />,
      quote: "MyPadiFood's AI-powered translation and multi-currency system helped my farm reach customers in 5 different countries. Sales grew by 300% in just 2 months!",
      highlight: "AI Skill: Smart product categorization and seasonal demand prediction that optimized my inventory and increased sales.",
      metrics: "300% growth • 5 countries • 2 months"
    },
    {
      name: 'Regina Olumah',
      business: 'House of QG',
      industry: 'Fashion & Clothing',
      avatarColor: 'bg-purple-100',
      icon: <Smartphone className="w-6 h-6 text-purple-600" />,
      quote: "Customers love that they can order in their local language without signing up. My international orders tripled immediately after setting up my store.",
      highlight: "AI Skill: Fashion trend analysis and automated size recommendations that reduced return rates by 40%.",
      metrics: "200% increase • 40% fewer returns • 12 languages"
    },
    {
      name: 'Hunsu Mercy',
      business: 'Mecap Apartment',
      industry: 'Hospitality',
      avatarColor: 'bg-blue-100',
      icon: <Home className="w-6 h-6 text-blue-600" />,
      quote: "International guests can now book my apartments in their currency and language. WhatsApp integration makes confirmations seamless!",
      highlight: "AI Skill: Dynamic pricing and availability optimization that increased occupancy rates by 65% year-round.",
      metrics: "65% occupancy • Instant bookings • Global reach"
    }
  ]

  const languages = ['English', 'Español', 'Français', 'Deutsch', '中文', '日本語', '한국어', 'Português', 'العربية']
  const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']

  const features = [
    {
      title: 'Global Language Support',
      description: 'Set your store language and let customers switch to their preferred language',
      icon: <Languages className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Multi-Currency Ready',
      description: 'Display prices in any currency. Automatic conversion for international customers',
      icon: <DollarSign className="w-6 h-6 text-green-600" />
    },
    {
      title: 'No Sign-Up Required',
      description: 'Customers can buy instantly with just their phone number. No registration needed',
      icon: <Users className="w-6 h-6 text-purple-600" />
    },
    {
      title: 'WhatsApp Integration',
      description: 'All orders automatically route to your WhatsApp Business for instant follow-up',
      icon: <MessageCircle className="w-6 h-6 text-green-500" />
    },
    {
      title: 'Phone-Based Reviews',
      description: 'Customers can rate and review using just their phone number from purchase',
      icon: <Star className="w-6 h-6 text-amber-600" />
    },
    {
      title: '24-Hour Global Setup',
      description: 'Launch your international store in under 24 hours. No coding needed',
      icon: <Zap className="w-6 h-6 text-red-600" />
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Language Symbols */}
        <div className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full animate-blob"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/4 w-14 h-14 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full animate-blob animation-delay-4000"></div>
        
        {/* Currency Symbols Animation */}
        <div className="absolute top-1/3 right-1/4 animate-float">
          <div className="text-2xl opacity-20">€</div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float animation-delay-1000">
          <div className="text-2xl opacity-20">¥</div>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float animation-delay-1500">
          <div className="text-2xl opacity-20">£</div>
        </div>
      </div>

      {/* Language/Currency Selector Demo */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
          <Languages className="w-4 h-4" />
          <select 
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-transparent text-sm focus:outline-none"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
          <DollarSign className="w-4 h-4" />
          <select 
            value={currentCurrency}
            onChange={(e) => setCurrentCurrency(e.target.value)}
            className="bg-transparent text-sm focus:outline-none"
          >
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left Column - Hero Content */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium text-sm">
              <Globe className="w-4 h-4" />
              Serving Businesses in 50+ Countries
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Your Business,
                <span className="gradient-text block">
                  No Language Barrier.
                </span>
              </h1>
              
              <p className="text-xl text-gray-300">
                The first truly global commerce platform where customers buy in their language, 
                with their currency, without signing up. All orders go straight to your WhatsApp.
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="glass rounded-xl p-4 backdrop-blur-sm border border-white/10 hover-shine transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{feature.title}</div>
                      <div className="text-sm text-gray-400 mt-1">{feature.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Start Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Go Global in 24 Hours
              </h3>
              
              <form onSubmit={handleQuickStart} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourbusiness@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-xs text-gray-400 text-center">
                  No credit card • 14-day free trial • Global support 24/7
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Testimonials & Demo */}
          <div className="lg:w-1/2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Testimonial Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Global Success Stories</h3>
                    <p className="text-blue-200/80">Real businesses, real results worldwide</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? <Volume2 className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentTestimonial((prev) => (prev - 1 + 3) % 3)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        onClick={() => setCurrentTestimonial((prev) => (prev + 1) % 3)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial Content */}
              <div className="p-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      currentTestimonial === index ? 'block' : 'hidden'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-xl ${testimonial.avatarColor} flex items-center justify-center`}>
                        {testimonial.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-xs font-medium text-blue-200">
                            {testimonial.business}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{testimonial.industry}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <blockquote className="text-lg italic text-gray-300 mb-6 border-l-4 border-blue-500 pl-4 py-2">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-cyan-300 mb-2">
                        <Zap className="w-4 h-4" />
                        AI-Powered Advantage
                      </div>
                      <p className="text-sm text-gray-300">{testimonial.highlight}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>{testimonial.metrics}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Testimonial Indicators */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {[0,1,2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentTestimonial === index 
                          ? 'w-8 bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Global Stats */}
              <div className="border-t border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">50+</div>
                    <div className="text-xs text-gray-300">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">24hr</div>
                    <div className="text-xs text-gray-300">Setup Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">0</div>
                    <div className="text-xs text-gray-300">Sign-Up Required</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">∞</div>
                    <div className="text-xs text-gray-300">Languages Supported</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className={`mt-24 ${animate ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Three Steps to Global Commerce
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From registration to international sales in less than 24 hours
            </p>
          </div>
          
          {/* Steps Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500"></div>
            
            <div className="space-y-12">
              {[
                {
                  step: 1,
                  title: "Register Your Business",
                  description: "Create your account with business details. Set your preferred language and currency.",
                  icon: "🌍",
                  delay: "300"
                },
                {
                  step: 2,
                  title: "Add Products & Set Prices",
                  description: "Upload products in any currency. Customers see prices in their local currency automatically.",
                  icon: "💰",
                  delay: "600"
                },
                {
                  step: 3,
                  title: "Share & Start Selling",
                  description: "Share your store link. Customers buy without signing up. Orders go to your WhatsApp.",
                  icon: "📱",
                  delay: "900"
                }
              ].map((stepData) => (
                <div 
                  key={stepData.step}
                  className={`flex items-center justify-center gap-8 animate-slide-up animation-delay-${stepData.delay}`}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-2xl z-10 ${
                    stepData.step % 2 === 0 ? 'order-3' : 'order-1'
                  }`}>
                    {stepData.icon}
                  </div>
                  
                  <div className={`glass rounded-2xl p-6 w-96 backdrop-blur-sm border border-white/10 ${
                    stepData.step % 2 === 0 ? 'order-1 text-right' : 'order-3'
                  }`}>
                    <div className="text-sm font-semibold text-blue-400 mb-2">STEP {stepData.step}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{stepData.title}</h3>
                    <p className="text-gray-300">{stepData.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Global Reach Visualization */}
          <div className="mt-20 glass rounded-3xl p-8 backdrop-blur-sm border border-white/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Worldwide Business Network
              </h3>
              <p className="text-gray-300">
                Join thousands of businesses already selling across borders
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-400 mb-2">5,000+</div>
                <div className="text-gray-300">Global Businesses</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-green-400 mb-2">150K+</div>
                <div className="text-gray-300">Monthly Transactions</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-purple-400 mb-2">75+</div>
                <div className="text-gray-300">Languages Used</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-cyan-400 mb-2">40+</div>
                <div className="text-gray-300">Currencies Supported</div>
              </div>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-8">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">No technical skills required</span>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-6">
              Ready to Sell to the World?
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setActiveView('onboarding')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Global Free Trial
              </button>
              <button
                onClick={() => setActiveView('businesses')}
                className="px-8 py-3 glass backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                See Live Global Stores
              </button>
            </div>
            
            <p className="text-gray-400 mt-6 text-sm">
              Your customers are waiting worldwide. Start selling in their language today.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}