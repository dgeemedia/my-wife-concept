// frontend/app/api/language/detect/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'

    // Try to get country from IP
    let countryCode = 'default'
    
    try {
      // You can use a free IP geolocation service
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: {
          'User-Agent': 'MypadiFood-App/1.0'
        }
      })
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        countryCode = geoData.country_code || 'default'
      }
    } catch (error) {
      console.log('IP geolocation failed:', error)
    }

    // Map country to language
    const countryLanguageMap: Record<string, string> = {
      // West Africa
      'NG': 'en', // Nigeria - English
      'GH': 'en', // Ghana - English
      'SN': 'fr', // Senegal - French
      'CI': 'fr', // Ivory Coast - French
      'TG': 'fr', // Togo - French
      'BJ': 'fr', // Benin - French
      'ML': 'fr', // Mali - French
      'BF': 'fr', // Burkina Faso - French
      'NE': 'fr', // Niger - French
      'GW': 'pt', // Guinea-Bissau - Portuguese
      'GN': 'fr', // Guinea - French
      'LR': 'en', // Liberia - English
      'SL': 'en', // Sierra Leone - English
      'MR': 'ar', // Mauritania - Arabic
      'CV': 'pt', // Cape Verde - Portuguese
      
      // East Africa
      'KE': 'en', // Kenya - English
      'TZ': 'sw', // Tanzania - Swahili
      'UG': 'en', // Uganda - English
      'RW': 'en', // Rwanda - English
      'BI': 'fr', // Burundi - French
      'ET': 'am', // Ethiopia - Amharic
      'ER': 'ar', // Eritrea - Arabic
      'DJ': 'ar', // Djibouti - Arabic
      'SO': 'so', // Somalia - Somali
      'SS': 'en', // South Sudan - English
      
      // Central Africa
      'CM': 'fr', // Cameroon - French
      'CG': 'fr', // Congo - French
      'CD': 'fr', // DR Congo - French
      'GA': 'fr', // Gabon - French
      'GQ': 'es', // Equatorial Guinea - Spanish
      'TD': 'fr', // Chad - French
      'CF': 'fr', // Central African Republic - French
      'AO': 'pt', // Angola - Portuguese
      'ST': 'pt', // Sao Tome and Principe - Portuguese
      
      // North Africa
      'EG': 'ar', // Egypt - Arabic
      'MA': 'ar', // Morocco - Arabic
      'TN': 'ar', // Tunisia - Arabic
      'DZ': 'ar', // Algeria - Arabic
      'LY': 'ar', // Libya - Arabic
      'SD': 'ar', // Sudan - Arabic
      
      // Southern Africa
      'ZA': 'en', // South Africa - English
      'BW': 'en', // Botswana - English
      'NA': 'en', // Namibia - English
      'ZM': 'en', // Zambia - English
      'ZW': 'en', // Zimbabwe - English
      'MW': 'en', // Malawi - English
      'MZ': 'pt', // Mozambique - Portuguese
      'SZ': 'en', // Eswatini - English
      'LS': 'en', // Lesotho - English
      'MG': 'fr', // Madagascar - French
      'MU': 'en', // Mauritius - English
      'SC': 'en', // Seychelles - English
      'KM': 'ar', // Comoros - Arabic
      
      // Europe
      'FR': 'fr', // France - French
      'DE': 'de', // Germany - German
      'GB': 'en', // UK - English
      'ES': 'es', // Spain - Spanish
      'IT': 'it', // Italy - Italian
      'PT': 'pt', // Portugal - Portuguese
      'NL': 'nl', // Netherlands - Dutch
      'BE': 'fr', // Belgium - French
      'CH': 'de', // Switzerland - German
      
      // Middle East
      'IQ': 'ar', // Iraq - Arabic
      'SA': 'ar', // Saudi Arabia - Arabic
      'AE': 'ar', // UAE - Arabic
      'QA': 'ar', // Qatar - Arabic
      'KW': 'ar', // Kuwait - Arabic
      'BH': 'ar', // Bahrain - Arabic
      'OM': 'ar', // Oman - Arabic
      'YE': 'ar', // Yemen - Arabic
      'JO': 'ar', // Jordan - Arabic
      'LB': 'ar', // Lebanon - Arabic
      'SY': 'ar', // Syria - Arabic
      'IR': 'fa', // Iran - Persian
      
      // Asia
      'IN': 'hi', // India - Hindi
      'PK': 'ur', // Pakistan - Urdu
      'BD': 'bn', // Bangladesh - Bengali
      'LK': 'si', // Sri Lanka - Sinhala
      'NP': 'ne', // Nepal - Nepali
      'BT': 'dz', // Bhutan - Dzongkha
      'MV': 'dv', // Maldives - Dhivehi
      'AF': 'ps', // Afghanistan - Pashto
      
      // East Asia
      'CN': 'zh', // China - Chinese
      'JP': 'ja', // Japan - Japanese
      'KR': 'ko', // South Korea - Korean
      'TW': 'zh', // Taiwan - Chinese
      'HK': 'zh', // Hong Kong - Chinese
      'MO': 'zh', // Macau - Chinese
      'MN': 'mn', // Mongolia - Mongolian
      
      // Southeast Asia
      'TH': 'th', // Thailand - Thai
      'VN': 'vi', // Vietnam - Vietnamese
      'ID': 'id', // Indonesia - Indonesian
      'MY': 'ms', // Malaysia - Malay
      'SG': 'en', // Singapore - English
      'PH': 'en', // Philippines - English
      'MM': 'my', // Myanmar - Burmese
      'LA': 'lo', // Laos - Lao
      'KH': 'km', // Cambodia - Khmer
      'BN': 'ms', // Brunei - Malay
      'TL': 'pt', // Timor-Leste - Portuguese
      
      // Americas
      'US': 'en', // USA - English
      'CA': 'en', // Canada - English
      'MX': 'es', // Mexico - Spanish
      'BR': 'pt', // Brazil - Portuguese
      'AR': 'es', // Argentina - Spanish
      'CO': 'es', // Colombia - Spanish
      'PE': 'es', // Peru - Spanish
      'VE': 'es', // Venezuela - Spanish
      'CL': 'es', // Chile - Spanish
      'EC': 'es', // Ecuador - Spanish
      'BO': 'es', // Bolivia - Spanish
      'PY': 'es', // Paraguay - Spanish
      'UY': 'es', // Uruguay - Spanish
      'CU': 'es', // Cuba - Spanish
      'DO': 'es', // Dominican Republic - Spanish
      'HT': 'fr', // Haiti - French
      'JM': 'en', // Jamaica - English
      'TT': 'en', // Trinidad and Tobago - English
      'BS': 'en', // Bahamas - English
      'BB': 'en', // Barbados - English
      'GD': 'en', // Grenada - English
      'LC': 'en', // Saint Lucia - English
      'VC': 'en', // Saint Vincent and the Grenadines - English
      'AG': 'en', // Antigua and Barbuda - English
      'DM': 'en', // Dominica - English
      'KN': 'en', // Saint Kitts and Nevis - English
      'SR': 'nl', // Suriname - Dutch
      'GY': 'en', // Guyana - English
      
      // Oceania
      'AU': 'en', // Australia - English
      'NZ': 'en', // New Zealand - English
      'FJ': 'en', // Fiji - English
      'PG': 'en', // Papua New Guinea - English
      'SB': 'en', // Solomon Islands - English
      'VU': 'fr', // Vanuatu - French
      'NC': 'fr', // New Caledonia - French
      'PF': 'fr', // French Polynesia - French
      'WS': 'sm', // Samoa - Samoan
      'TO': 'to', // Tonga - Tongan
      'FM': 'en', // Micronesia - English
      'MH': 'en', // Marshall Islands - English
      'KI': 'en', // Kiribati - English
      'TV': 'en', // Tuvalu - English
      'NR': 'en', // Nauru - English
      'PW': 'en', // Palau - English
    }

    const detectedLanguage = countryLanguageMap[countryCode] || 'en'

    // Get browser language as fallback
    const acceptLanguage = request.headers.get('accept-language') || ''
    const browserLanguages = acceptLanguage.split(',').map(lang => lang.split(';')[0].toLowerCase())

    // Check if browser language is supported
    const supportedLanguages = ['en', 'fr', 'yo', 'ig', 'ha', 'de', 'ar', 'sw', 'hi']
    const browserLang = browserLanguages.find(lang => supportedLanguages.includes(lang.split('-')[0]))

    const finalLanguage = browserLang?.split('-')[0] || detectedLanguage

    return NextResponse.json({
      success: true,
      ip,
      countryCode,
      detectedLanguage: finalLanguage,
      browserLanguages,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Language detection error:', error)
    return NextResponse.json({
      success: false,
      detectedLanguage: 'en',
      error: 'Failed to detect language'
    }, { status: 500 })
  }
}