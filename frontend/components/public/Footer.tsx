// components/public/Footer.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle, Linkedin, Youtube, Send, ArrowUp } from 'lucide-react'
import { BusinessSettings } from '@/types'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

interface FooterProps {
  settings?: BusinessSettings | null
}

// X (Twitter) SVG Icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// TikTok SVG Icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function Footer({ settings }: FooterProps) {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const footerRef = useRef<HTMLElement>(null)

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current)
      }
    }
  }, [])

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Function to open WhatsApp widget
  const openWhatsAppWidget = () => {
    // Dispatch custom event to open WhatsApp widget
    window.dispatchEvent(new CustomEvent('open-whatsapp-widget'))
  }

  // Collect social media links dynamically
  const socialLinks = [
    {
      url: settings?.facebookUrl,
      icon: Facebook,
      label: 'Facebook',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      url: settings?.instagramUrl,
      icon: Instagram,
      label: 'Instagram',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      url: settings?.twitterUrl,
      icon: XIcon,
      label: 'X (Twitter)',
      hoverColor: 'hover:bg-gray-900'
    },
    {
      url: settings?.linkedinUrl,
      icon: Linkedin,
      label: 'LinkedIn',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      url: settings?.tiktokUrl,
      icon: TikTokIcon,
      label: 'TikTok',
      hoverColor: 'hover:bg-black'
    },
    {
      url: settings?.youtubeUrl,
      icon: Youtube,
      label: 'YouTube',
      hoverColor: 'hover:bg-red-600'
    },
  ].filter(link => link.url)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error(t('errors.pleaseEnterEmail'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error(t('errors.invalidEmail'))
      return
    }

    setSubscribing(true)

    try {
      const message = t('footer.newsletterSubmissionMessage', {
        email,
        businessName: settings?.businessName || 'MyBusiness',
        date: new Date().toLocaleString()
      })

      const whatsappNumber = settings?.whatsappNumber?.replace(/[^\d]/g, '') || ''
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

      window.open(whatsappUrl, '_blank')
      toast.success(t('footer.openingWhatsAppSubscription'))
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error(t('footer.subscriptionFailed'))
    } finally {
      setSubscribing(false)
    }
  }

  const getNewsletterText = () => {
    const businessType = settings?.businessType || 'default'
    const key = `footer.newsletter${businessType.charAt(0).toUpperCase() + businessType.slice(1)}`
    return t(key)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform animate-bounce-in"
          aria-label={t('footer.scrollToTop')}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      <footer 
        ref={footerRef}
        className="bg-gray-900 dark:bg-black text-white relative overflow-hidden"
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-pink-900/20 animate-gradient-shift"></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Business Info - Animated */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                 style={{ transitionDelay: '0ms' }}>
              <div className="flex items-center space-x-3 mb-4">
                {settings?.logo ? (
                  <Image
                    src={settings.logo}
                    alt={settings.businessName || t('footer.businessLogo')}
                    width={40}
                    height={40}
                    className="rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg"></div>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl">{settings?.businessName || 'MyBusiness'}</h3>
                </div>
              </div>
              
              {settings?.businessMotto && (
                <p className="text-primary-400 text-sm italic mb-4">
                  "{settings.businessMotto}"
                </p>
              )}
              
              <p className="text-gray-400 mb-6">
                {settings?.footerText || settings?.description || t('footer.qualityProducts')}
              </p>
              
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => {
                    const IconComponent = link.icon
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center ${link.hoverColor} transition-all hover:scale-110 hover:shadow-lg`}
                        title={link.label}
                      >
                        <IconComponent />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick Links - Animated */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                 style={{ transitionDelay: '150ms' }}>
              <h3 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all">
                    {t('header.home')}
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollToSection('products')} className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all">
                    {settings?.businessType === 'hotel' || settings?.businessType === 'shortlet' ? t('footer.listings') : t('header.viewStore')}
                  </button>
                </li>
                <li>
                  <a href="/track" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all">
                    {t('header.trackOrder')}
                  </a>
                </li>
                <li>
                  <button onClick={openWhatsAppWidget} className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all">
                    {t('header.support')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info - Animated */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                 style={{ transitionDelay: '300ms' }}>
              <h3 className="text-lg font-semibold mb-6">{t('footer.contactUs')}</h3>
              <ul className="space-y-4">
                {(settings?.footerPhone || settings?.phone) && (
                  <li className="flex items-start group">
                    <Phone className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <a 
                        href={`tel:${settings.footerPhone || settings.phone}`}
                        className="font-medium hover:text-primary-400 transition-colors"
                      >
                        {settings.footerPhone || settings.phone}
                      </a>
                      <p className="text-sm text-gray-400">{t('footer.phone')}</p>
                    </div>
                  </li>
                )}
                {(settings?.footerEmail || settings?.email) && (
                  <li className="flex items-start group">
                    <Mail className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <a 
                        href={`mailto:${settings.footerEmail || settings.email}`}
                        className="font-medium hover:text-primary-400 transition-colors break-all"
                      >
                        {settings.footerEmail || settings.email}
                      </a>
                      <p className="text-sm text-gray-400">{t('footer.email')}</p>
                    </div>
                  </li>
                )}
                {(settings?.footerAddress || settings?.address) && (
                  <li className="flex items-start group">
                    <MapPin className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium">{settings.footerAddress || settings.address}</p>
                      <p className="text-sm text-gray-400">{t('footer.address')}</p>
                    </div>
                  </li>
                )}
                {settings?.whatsappNumber && (
                  <li className="flex items-start group">
                    <MessageCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <a 
                        href={`https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-green-400 transition-colors"
                      >
                        {settings.whatsappNumber}
                      </a>
                      <p className="text-sm text-gray-400">{t('footer.whatsapp')}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter - Animated */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                 style={{ transitionDelay: '450ms' }}>
              <h3 className="text-lg font-semibold mb-6">{t('footer.stayUpdated')}</h3>
              <p className="text-gray-400 mb-4 text-sm">
                {getNewsletterText()}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.yourEmail')}
                    disabled={subscribing}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={subscribing || !email}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-r-lg font-medium transition-all flex items-center justify-center min-w-[60px] hover:shadow-lg"
                  >
                    {subscribing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {t('footer.subscribeNote')}
                </p>
              </form>
            </div>
          </div>

          {/* Divider with glow effect */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Bottom Bar - Animated */}
          <div className={`flex flex-col md:flex-row justify-between items-center transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
               style={{ transitionDelay: '600ms' }}>
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {settings?.footerCopyright?.replace('{year}', currentYear.toString()) ||
                t('footer.copyright', { year: currentYear, businessName: settings?.businessName || 'MyBusiness' })}
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <button onClick={() => scrollToSection('privacy')} className="hover:text-white transition-colors">
                {t('footer.privacyPolicy')}
              </button>
              <button onClick={() => scrollToSection('terms')} className="hover:text-white transition-colors">
                {t('footer.termsOfService')}
              </button>
              <button onClick={() => scrollToSection('refund')} className="hover:text-white transition-colors">
                {t('footer.refundPolicy')}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}