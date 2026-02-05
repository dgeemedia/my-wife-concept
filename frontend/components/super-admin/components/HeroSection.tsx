// frontend/components/super-admin/components/HeroSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { Building2, Store, MessageCircle, ChevronRight, Sparkles, TrendingUp, Users, Globe } from 'lucide-react'
import FeatureCard from './FeatureCard'

interface HeroSectionProps {
  setActiveView: (view: 'businesses' | 'onboarding') => void
}

export default function HeroSection({ setActiveView }: HeroSectionProps) {
  const [animate, setAnimate] = useState(false)
  const [activeDemo, setActiveDemo] = useState(0)
  
  const demos = [
    { title: 'Restaurant Dashboard', color: 'from-orange-500 to-red-500', icon: '🍽️' },
    { title: 'Retail Store', color: 'from-green-500 to-emerald-500', icon: '🛒' },
    { title: 'Hotel Booking', color: 'from-blue-500 to-cyan-500', icon: '🏨' },
    { title: 'Fashion Shop', color: 'from-pink-500 to-rose-500', icon: '👗' },
  ]

  useEffect(() => {
    setAnimate(true)
    
    // Auto-rotate demos
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [demos.length])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        {/* Header with Animation */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-600 font-medium text-sm animate-fade-in">
            <Sparkles className="w-4 h-4" />
            The All-in-One Business Platform
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className={`block ${animate ? 'animate-slide-up' : 'opacity-0'} transition-all duration-1000`}>
              Grow Your Business
            </span>
            <span className={`block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ${animate ? 'animate-slide-up animation-delay-300' : 'opacity-0'} transition-all duration-1000 delay-300`}>
              With MyPadiFood
            </span>
          </h1>
          
          <p className={`text-2xl text-gray-600 max-w-3xl mx-auto ${animate ? 'animate-fade-in animation-delay-600' : 'opacity-0'} transition-all duration-1000 delay-600`}>
            Everything you need to start, run, and grow your business online. 
            Join <span className="font-semibold text-blue-600">1,000+</span> successful businesses already with us.
          </p>

          {/* Stats */}
          <div className={`flex flex-wrap justify-center gap-8 mt-10 ${animate ? 'animate-fade-in animation-delay-900' : 'opacity-0'} transition-all duration-1000 delay-900`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">1,000+</div>
              <div className="text-gray-600">Active Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">50,000+</div>
              <div className="text-gray-600">Monthly Orders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">₦500M+</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>

        {/* Main CTA with Floating Effect */}
        <div className={`flex flex-col sm:flex-row justify-center gap-6 mb-20 ${animate ? 'animate-fade-in animation-delay-1200' : 'opacity-0'} transition-all duration-1000 delay-1200`}>
          <button
            onClick={() => setActiveView('onboarding')}
            className="group relative flex items-center justify-center px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-semibold text-xl shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur group-hover:blur-lg transition-all duration-300"></div>
            <div className="relative z-10 flex items-center">
              <Building2 className="w-7 h-7 mr-3 group-hover:animate-bounce" />
              Start Your Business — Free 14-Day Trial
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
          
          <button
            onClick={() => setActiveView('businesses')}
            className="group relative flex items-center justify-center px-10 py-5 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 font-semibold text-xl"
          >
            <div className="relative z-10 flex items-center">
              <Store className="w-7 h-7 mr-3 text-blue-600" />
              Explore Live Demos
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>

        {/* Interactive Demo Preview */}
        <div className={`relative mb-20 ${animate ? 'animate-fade-in animation-delay-1500' : 'opacity-0'} transition-all duration-1000 delay-1500`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Live Demo Preview</h3>
                <div className="flex gap-2">
                  {demos.map((demo, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDemo(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeDemo === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {demo.icon} {demo.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] overflow-hidden">
              {/* Animated Dashboard Preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-4xl">
                  {/* Mock Browser Window */}
                  <div className="bg-gray-100 rounded-t-lg p-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 text-sm text-gray-600">https://{demos[activeDemo].title.toLowerCase().replace(/\s+/g, '')}.mypadifood.com</div>
                  </div>
                  
                  <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
                    <div className={`h-64 bg-gradient-to-br ${demos[activeDemo].color} flex items-center justify-center relative`}>
                      <div className="text-7xl animate-pulse">{demos[activeDemo].icon}</div>
                      
                      {/* Animated Stats Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 animate-slide-up">
                          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                          <div className="text-2xl font-bold">45%</div>
                          <div className="text-sm text-gray-600">Growth</div>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 animate-slide-up animation-delay-200">
                          <Users className="w-6 h-6 text-blue-600 mb-2" />
                          <div className="text-2xl font-bold">1.2K</div>
                          <div className="text-sm text-gray-600">Customers</div>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 animate-slide-up animation-delay-400">
                          <Globe className="w-6 h-6 text-purple-600 mb-2" />
                          <div className="text-2xl font-bold">24/7</div>
                          <div className="text-sm text-gray-600">Online</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400/20 rounded-full animate-float"></div>
              <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400/20 rounded-full animate-float animation-delay-1000"></div>
              <div className="absolute top-32 right-32 w-12 h-12 bg-green-400/20 rounded-full animate-float animation-delay-1500"></div>
            </div>
          </div>
        </div>

        {/* Features Grid with Enhanced Cards */}
        <div className={`${animate ? 'animate-fade-in animation-delay-1800' : 'opacity-0'} transition-all duration-1000 delay-1800`}>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Succeed</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<div className="relative">
                <Building2 className="w-14 h-14 text-blue-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-sm font-bold text-blue-600">∞</span>
                </div>
              </div>}
              title="Unlimited Businesses"
              description="Manage multiple businesses from one dashboard. Scale without limits."
              gradient="from-blue-500/10 to-blue-600/10"
              features={['Multi-store management', 'Cross-business analytics', 'Unified customer database']}
            />
            
            <FeatureCard
              icon={<div className="relative">
                <Store className="w-14 h-14 text-green-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-sm font-bold text-green-600">⚡</span>
                </div>
              </div>}
              title="Easy Onboarding"
              description="Go live in minutes, not weeks. We handle the technical setup."
              gradient="from-green-500/10 to-emerald-600/10"
              features={['One-click setup', 'No coding required', '24/7 expert support']}
            />
            
            <FeatureCard
              icon={<div className="relative">
                <MessageCircle className="w-14 h-14 text-purple-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center animate-ping">
                  <span className="text-xs font-bold text-purple-600">!</span>
                </div>
              </div>}
              title="24/7 Support"
              description="Real human support via WhatsApp. Never be stuck again."
              gradient="from-purple-500/10 to-pink-600/10"
              features={['Instant WhatsApp support', 'Priority phone support', 'Dedicated account manager']}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`mt-20 text-center ${animate ? 'animate-fade-in animation-delay-2100' : 'opacity-0'} transition-all duration-1000 delay-2100`}>
          <p className="text-gray-600 mb-8">Trusted by businesses of all sizes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {/* You can replace these with actual logos */}
            <div className="text-3xl">🏪</div>
            <div className="text-3xl">🏨</div>
            <div className="text-3xl">🍕</div>
            <div className="text-3xl">👗</div>
            <div className="text-3xl">📱</div>
            <div className="text-3xl">💊</div>
          </div>
        </div>

        {/* Final CTA with Countdown */}
        <div className={`mt-20 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl p-8 text-center backdrop-blur-sm ${animate ? 'animate-fade-in animation-delay-2400' : 'opacity-0'} transition-all duration-1000 delay-2400`}>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful businesses today. Free 14-day trial, no credit card required.
          </p>
          <button
            onClick={() => setActiveView('onboarding')}
            className="group relative inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl"
          >
            <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-300" />
            Start Free Trial — Limited Time Offer
            <div className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm animate-pulse">
              14 Days Free
            </div>
          </button>
          <p className="text-sm text-gray-500 mt-4">
            No setup fees • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}