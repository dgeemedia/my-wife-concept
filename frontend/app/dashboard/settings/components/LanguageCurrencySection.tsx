// frontend/app/dashboard/settings/components/LanguageCurrencySection.tsx
import { Globe } from 'lucide-react'

interface LanguageCurrencySectionProps {
  settings: any
  handleChange: (e: any) => void
  languages: any[]
  currencies: any[]
}

export default function LanguageCurrencySection({
  settings,
  handleChange,
  languages,
  currencies
}: LanguageCurrencySectionProps) {
  return (
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
            {languages.map(lang => (
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
            <optgroup label="West Africa">
              {currencies.filter(c => 
                ['NGN', 'GHS', 'XOF', 'GMD', 'GNF', 'LRD', 'MRU', 'SLE', 'CVE'].includes(c.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="East Africa">
              {currencies.filter(c => 
                ['KES', 'TZS', 'UGX', 'ETB', 'RWF', 'BIF', 'SOS', 'SSP', 'SDG', 'ERN', 'DJF', 'MGA', 'MWK', 'MUR', 'MZN', 'SCR', 'KMF', 'ZMW', 'ZWL'].includes(c.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Central Africa">
              {currencies.filter(c => 
                ['XAF', 'CDF', 'AOA', 'STN'].includes(c.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="North Africa">
              {currencies.filter(c => 
                ['EGP', 'MAD', 'TND', 'DZD', 'LYD'].includes(c.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Southern Africa">
              {currencies.filter(c => 
                ['ZAR', 'BWP', 'LSL', 'NAD', 'SZL'].includes(c.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="International">
              {currencies.filter(c => 
                ['USD', 'EUR', 'GBP'].includes(c.code)
              ).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            This will affect all product prices and order totals
          </p>
        </div>
      </div>
    </div>
  )
}