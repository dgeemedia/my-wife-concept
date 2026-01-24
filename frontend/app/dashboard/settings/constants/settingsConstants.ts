// frontend/app/dashboard/settings/constants/settingsConstants.ts
export const COLOR_PRESETS = [
  { name: 'Green', primary: '#10B981', secondary: '#F59E0B' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#8B5CF6' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#EC4899' },
  { name: 'Red', primary: '#EF4444', secondary: '#F59E0B' },
  { name: 'Orange', primary: '#F97316', secondary: '#EAB308' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#06B6D4' },
]

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
]

export const AFRICAN_CURRENCIES = [
  // North Africa
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', country: 'Algeria', region: 'North Africa' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', country: 'Egypt', region: 'North Africa' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', country: 'Libya', region: 'North Africa' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco', region: 'North Africa' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', country: 'Tunisia', region: 'North Africa' },
  
  // West Africa
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', country: 'Benin, Burkina Faso, Côte d\'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo', region: 'West Africa' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', country: 'Gambia', region: 'West Africa' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana', region: 'West Africa' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'Fr', country: 'Guinea', region: 'West Africa' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: '$', country: 'Liberia', region: 'West Africa' },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', country: 'Mauritania', region: 'West Africa' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria', region: 'West Africa' },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', country: 'Sierra Leone', region: 'West Africa' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', country: 'Cape Verde', region: 'West Africa' },
  
  // Central Africa
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', country: 'Cameroon, CAR, Chad, Congo, Equatorial Guinea, Gabon', region: 'Central Africa' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'Fr', country: 'DR Congo', region: 'Central Africa' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'Fr', country: 'Burundi', region: 'Central Africa' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'Fr', country: 'Rwanda', region: 'Central Africa' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', country: 'São Tomé and Príncipe', region: 'Central Africa' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', country: 'Angola', region: 'Central Africa' },
  
  // East Africa
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia', region: 'East Africa' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya', region: 'East Africa' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', country: 'Madagascar', region: 'East Africa' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', country: 'Malawi', region: 'East Africa' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', country: 'Mauritius', region: 'East Africa' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', country: 'Mozambique', region: 'East Africa' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', country: 'Seychelles', region: 'East Africa' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh', country: 'Somalia', region: 'East Africa' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', country: 'South Sudan', region: 'East Africa' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: '£', country: 'Sudan', region: 'East Africa' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania', region: 'East Africa' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda', region: 'East Africa' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', country: 'Zambia', region: 'East Africa' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$', country: 'Zimbabwe', region: 'East Africa' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', country: 'Eritrea', region: 'East Africa' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fr', country: 'Djibouti', region: 'East Africa' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'Fr', country: 'Comoros', region: 'East Africa' },
  
  // Southern Africa
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa, Lesotho, Eswatini, Namibia', region: 'Southern Africa' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', country: 'Botswana', region: 'Southern Africa' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', country: 'Lesotho', region: 'Southern Africa' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: '$', country: 'Namibia', region: 'Southern Africa' },
  { code: 'SZL', name: 'Eswatini Lilangeni', symbol: 'L', country: 'Eswatini', region: 'Southern Africa' },
  
  // Common international currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', region: 'International' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', region: 'International' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom', region: 'International' },
]

export type SettingsType = {
  id: number
  businessName: string
  businessType: string
  businessMotto: string
  phone: string
  email: string
  address: string
  description: string
  logo: string
  primaryColor: string
  secondaryColor: string
  currency: string
  language: string
  whatsappNumber: string
  facebookUrl: string
  instagramUrl: string
  twitterUrl: string
  linkedinUrl: string
  tiktokUrl: string
  youtubeUrl: string
  footerText: string
  footerCopyright: string
  footerAddress: string
  footerEmail: string
  footerPhone: string
  createdAt: string
  updatedAt: string
}