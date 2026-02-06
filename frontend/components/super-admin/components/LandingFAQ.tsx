// frontend/components/super-admin/components/LandingFAQ.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PLATFORM_WHATSAPP } from '../constants/platform'

export default function LandingFAQ() {
  const { t } = useTranslation('landing')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(t('faq.whatsappMessage'))
    window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
  }

  const faqCategories = [
    {
      category: t('faq.categories.general'),
      questions: [
        { q: 'whatIsMyPadiFood', a: 'whatIsMyPadiFoodAnswer' },
        { q: 'whoCanUse', a: 'whoCanUseAnswer' },
        { q: 'howDifferent', a: 'howDifferentAnswer' }
      ]
    },
    {
      category: t('faq.categories.pricing'),
      questions: [
        { q: 'freeTrial', a: 'freeTrialAnswer' },
        { q: 'subscriptionPlans', a: 'subscriptionPlansAnswer' },
        { q: 'paymentMethods', a: 'paymentMethodsAnswer' },
        { q: 'cancelAnytime', a: 'cancelAnytimeAnswer' }
      ]
    },
    {
      category: t('faq.categories.features'),
      questions: [
        { q: 'languagesSupported', a: 'languagesSupportedAnswer' },
        { q: 'currenciesSupported', a: 'currenciesSupportedAnswer' },
        { q: 'whatsappOrders', a: 'whatsappOrdersAnswer' },
        { q: 'customDomain', a: 'customDomainAnswer' },
        { q: 'cashPayments', a: 'cashPaymentsAnswer' }
      ]
    },
    {
      category: t('faq.categories.gettingStarted'),
      questions: [
        { q: 'setupTime', a: 'setupTimeAnswer' },
        { q: 'technicalKnowledge', a: 'technicalKnowledgeAnswer' },
        { q: 'productLimit', a: 'productLimitAnswer' },
        { q: 'migration', a: 'migrationAnswer' }
      ]
    },
    {
      category: t('faq.categories.support'),
      questions: [
        { q: 'customerSupport', a: 'customerSupportAnswer' },
        { q: 'training', a: 'trainingAnswer' },
        { q: 'updates', a: 'updatesAnswer' }
      ]
    }
  ]

  return (
    <section id="faq-section" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
                {category.category}
              </h3>
              
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex
                  const isOpen = openIndex === globalIndex
                  
                  return (
                    <div
                      key={questionIndex}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left"
                      >
                        <span className="font-semibold text-gray-900 pr-8">
                          {t(`faq.questions.${item.q}`)}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                          {t(`faq.answers.${item.a}`)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Contact Support Section */}
          <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('faq.stillHaveQuestions')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('faq.contactSupport')}
              </p>
              <button
                onClick={handleWhatsAppSupport}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t('faq.chatWithSupport')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}