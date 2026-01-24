// frontend/lib/currency.ts
export const CURRENCY_SYMBOLS: Record<string, string> = {
  // North Africa
  'DZD': 'د.ج',  // Algerian Dinar
  'EGP': 'E£',   // Egyptian Pound
  'LYD': 'ل.د',  // Libyan Dinar
  'MAD': 'د.م.', // Moroccan Dirham
  'TND': 'د.ت',  // Tunisian Dinar
  
  // West Africa
  'XOF': 'CFA',  // West African CFA Franc
  'GMD': 'D',    // Gambian Dalasi
  'GHS': '₵',    // Ghanaian Cedi
  'GNF': 'Fr',   // Guinean Franc
  'LRD': '$',    // Liberian Dollar
  'MRU': 'UM',   // Mauritanian Ouguiya
  'NGN': '₦',    // Nigerian Naira
  'SLE': 'Le',   // Sierra Leonean Leone
  'CVE': '$',    // Cape Verdean Escudo
  
  // Central Africa
  'XAF': 'FCFA', // Central African CFA Franc
  'CDF': 'Fr',   // Congolese Franc
  'BIF': 'Fr',   // Burundian Franc
  'RWF': 'Fr',   // Rwandan Franc
  'STN': 'Db',   // São Tomé and Príncipe Dobra
  'AOA': 'Kz',   // Angolan Kwanza
  
  // East Africa
  'ETB': 'Br',   // Ethiopian Birr
  'KES': 'KSh',  // Kenyan Shilling
  'MGA': 'Ar',   // Malagasy Ariary
  'MWK': 'MK',   // Malawian Kwacha
  'MUR': '₨',    // Mauritian Rupee
  'MZN': 'MT',   // Mozambican Metical
  'SCR': '₨',    // Seychellois Rupee
  'SOS': 'Sh',   // Somali Shilling
  'SSP': '£',    // South Sudanese Pound
  'SDG': '£',    // Sudanese Pound
  'TZS': 'TSh',  // Tanzanian Shilling
  'UGX': 'USh',  // Ugandan Shilling
  'ZMW': 'ZK',   // Zambian Kwacha
  'ZWL': '$',    // Zimbabwean Dollar
  'ERN': 'Nfk',  // Eritrean Nakfa
  'DJF': 'Fr',   // Djiboutian Franc
  'KMF': 'Fr',   // Comorian Franc
  
  // Southern Africa
  'ZAR': 'R',    // South African Rand
  'BWP': 'P',    // Botswana Pula
  'LSL': 'L',    // Lesotho Loti
  'NAD': '$',    // Namibian Dollar
  'SZL': 'L',    // Eswatini Lilangeni
  
  // International
  'USD': '$',    // US Dollar
  'EUR': '€',    // Euro
  'GBP': '£',    // British Pound
  'CAD': '$',    // Canadian Dollar
  'AUD': '$',    // Australian Dollar
  
  // Default
  'DEFAULT': '₦' // Default to Naira for unknown currencies
}

export const CURRENCY_NAMES: Record<string, string> = {
  'DZD': 'Algerian Dinar',
  'EGP': 'Egyptian Pound',
  'LYD': 'Libyan Dinar',
  'MAD': 'Moroccan Dirham',
  'TND': 'Tunisian Dinar',
  'XOF': 'West African CFA Franc',
  'GMD': 'Gambian Dalasi',
  'GHS': 'Ghanaian Cedi',
  'GNF': 'Guinean Franc',
  'LRD': 'Liberian Dollar',
  'MRU': 'Mauritanian Ouguiya',
  'NGN': 'Nigerian Naira',
  'SLE': 'Sierra Leonean Leone',
  'CVE': 'Cape Verdean Escudo',
  'XAF': 'Central African CFA Franc',
  'CDF': 'Congolese Franc',
  'BIF': 'Burundian Franc',
  'RWF': 'Rwandan Franc',
  'STN': 'São Tomé and Príncipe Dobra',
  'AOA': 'Angolan Kwanza',
  'ETB': 'Ethiopian Birr',
  'KES': 'Kenyan Shilling',
  'MGA': 'Malagasy Ariary',
  'MWK': 'Malawian Kwacha',
  'MUR': 'Mauritian Rupee',
  'MZN': 'Mozambican Metical',
  'SCR': 'Seychellois Rupee',
  'SOS': 'Somali Shilling',
  'SSP': 'South Sudanese Pound',
  'SDG': 'Sudanese Pound',
  'TZS': 'Tanzanian Shilling',
  'UGX': 'Ugandan Shilling',
  'ZMW': 'Zambian Kwacha',
  'ZWL': 'Zimbabwean Dollar',
  'ERN': 'Eritrean Nakfa',
  'DJF': 'Djiboutian Franc',
  'KMF': 'Comorian Franc',
  'ZAR': 'South African Rand',
  'BWP': 'Botswana Pula',
  'LSL': 'Lesotho Loti',
  'NAD': 'Namibian Dollar',
  'SZL': 'Eswatini Lilangeni',
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'DEFAULT': 'Nigerian Naira'
}

export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode] || CURRENCY_SYMBOLS.DEFAULT
}

export const getCurrencyName = (currencyCode: string): string => {
  return CURRENCY_NAMES[currencyCode] || CURRENCY_NAMES.DEFAULT
}

export const formatCurrency = (
  amount: number, 
  currencyCode: string = 'NGN',
  options: Intl.NumberFormatOptions = {}
): string => {
  const symbol = getCurrencySymbol(currencyCode)
  
  // Set default options based on currency
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
  
  // Special formatting for specific currencies
  if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currencyCode)) {
    defaultOptions.minimumFractionDigits = 2
    defaultOptions.maximumFractionDigits = 2
  } else if (['XOF', 'XAF', 'DZD', 'MAD', 'TND'].includes(currencyCode)) {
    // French African currencies often show as whole numbers
    defaultOptions.minimumFractionDigits = 0
    defaultOptions.maximumFractionDigits = 0
  }
  
  const formatOptions = { ...defaultOptions, ...options }
  
  // Format the number
  const formattedNumber = amount.toLocaleString('en-US', formatOptions)
  
  // Determine symbol position based on currency
  if (['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'NGN', 'GHS', 'KES', 'TZS', 'UGX', 'ZAR'].includes(currencyCode)) {
    return `${symbol}${formattedNumber}`
  } else if (['XOF', 'XAF'].includes(currencyCode)) {
    return `${formattedNumber} ${symbol}`
  } else if (['EGP', 'SDG', 'SSP'].includes(currencyCode)) {
    return `${formattedNumber} ${symbol}`
  } else {
    return `${symbol}${formattedNumber}`
  }
}

// Helper to parse currency string back to number
export const parseCurrency = (currencyString: string, currencyCode: string = 'NGN'): number => {
  const symbol = getCurrencySymbol(currencyCode)
  // Remove symbol and formatting
  const cleaned = currencyString
    .replace(symbol, '')
    .replace(/[^\d.-]/g, '')
  return parseFloat(cleaned) || 0
}