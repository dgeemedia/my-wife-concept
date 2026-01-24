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
  const getRegionLanguages = (region: string) => {
    return languages.filter(l => l.region === region)
  }
  
  const getRegionCurrencies = (region: string) => {
    return currencies.filter(c => c.region === region)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center mb-6">
        <Globe className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Language & Currency</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language *
            <span className="ml-2 text-xs text-gray-500">
              ({languages.find(l => l.code === settings.language)?.nativeName || 'English'})
            </span>
          </label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <optgroup label="West Africa">
              {getRegionLanguages('West Africa').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName}) - {lang.code.toUpperCase()}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="East Africa">
              {getRegionLanguages('East Africa').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName}) - {lang.code.toUpperCase()}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Central Africa">
              {getRegionLanguages('Central Africa').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName}) - {lang.code.toUpperCase()}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="North Africa">
              {getRegionLanguages('North Africa').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName}) - {lang.code.toUpperCase()}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Southern Africa">
              {getRegionLanguages('Southern Africa').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName}) - {lang.code.toUpperCase()}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="International">
              {getRegionLanguages('International').map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            This will affect text on your landing page. Currently showing: <strong>{languages.find(l => l.code === settings.language)?.country || 'Multiple countries'}</strong>
          </p>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency * 
            <span className="ml-2 text-xs text-gray-500">
              ({currencies.find(c => c.code === settings.currency)?.symbol || '₦'})
            </span>
          </label>
          <select
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <optgroup label="West Africa">
              {getRegionCurrencies('West Africa').map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="East Africa">
              {getRegionCurrencies('East Africa').map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Central Africa">
              {getRegionCurrencies('Central Africa').map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="North Africa">
              {getRegionCurrencies('North Africa').map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Southern Africa">
              {getRegionCurrencies('Southern Africa').map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </optgroup>
            
            <optgroup label="International">
              {getRegionCurrencies('International').map(currency => (
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
      
      {/* Language & Currency Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Current Selection</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Language:</strong> {languages.find(l => l.code === settings.language)?.name || 'English'} 
                ({languages.find(l => l.code === settings.language)?.nativeName || 'English'})
              </p>
              <p>
                <strong>Currency:</strong> {currencies.find(c => c.code === settings.currency)?.name || 'Nigerian Naira'} 
                ({currencies.find(c => c.code === settings.currency)?.symbol || '₦'})
              </p>
              <p className="text-xs text-blue-700 mt-2">
                💡 Choose the language and currency that best serves your customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}