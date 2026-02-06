// frontend/components/super-admin/constants/businessTypes.ts
export const BUSINESS_TYPES = {
  food: { label: 'Food & Groceries', icon: '🍕', color: 'from-orange-500 to-red-500' },
  restaurant: { label: 'Restaurant', icon: '🍽️', color: 'from-red-500 to-pink-500' },
  hotel: { label: 'Hotel', icon: '🏨', color: 'from-blue-500 to-cyan-500' },
  shortlet: { label: 'Shortlet', icon: '🏠', color: 'from-purple-500 to-pink-500' },
  retail: { label: 'Retail Store', icon: '🛍️', color: 'from-green-500 to-emerald-500' },
  fashion: { label: 'Fashion & Clothing', icon: '👗', color: 'from-pink-500 to-rose-500' },
  electronics: { label: 'Electronics', icon: '📱', color: 'from-indigo-500 to-blue-500' },
  phones: { label: 'Phone & Gadgets', icon: '📱', color: 'from-cyan-500 to-blue-500' },
  computers: { label: 'Computers & IT', icon: '💻', color: 'from-gray-600 to-slate-600' },
  furniture: { label: 'Furniture', icon: '🛋️', color: 'from-amber-500 to-orange-500' },
  beauty: { label: 'Beauty & Cosmetics', icon: '💄', color: 'from-fuchsia-500 to-pink-500' },
  pharmacy: { label: 'Pharmacy & Health', icon: '💊', color: 'from-teal-500 to-green-500' },
  bookstore: { label: 'Books & Stationery', icon: '📚', color: 'from-blue-600 to-indigo-600' },
  sports: { label: 'Sports & Fitness', icon: '⚽', color: 'from-lime-500 to-green-600' },
  
  // Agriculture & Farming
  farming: { label: 'Farm Produce & Livestock', icon: '🌾', color: 'from-green-600 to-lime-600' },
  agriculture: { label: 'Agriculture & Crops', icon: '🚜', color: 'from-yellow-600 to-green-600' },
  livestock: { label: 'Livestock & Poultry', icon: '🐄', color: 'from-amber-600 to-yellow-600' },
  fishery: { label: 'Fishery & Aquaculture', icon: '🐟', color: 'from-blue-400 to-cyan-500' },
  dairy: { label: 'Dairy Products', icon: '🥛', color: 'from-blue-300 to-sky-400' },
  organic: { label: 'Organic Produce', icon: '🥬', color: 'from-green-500 to-emerald-600' },
  
  // Food Related
  bakery: { label: 'Bakery & Pastries', icon: '🥐', color: 'from-yellow-500 to-amber-500' },
  cafe: { label: 'Cafe & Coffee Shop', icon: '☕', color: 'from-brown-500 to-amber-600' },
  fastfood: { label: 'Fast Food', icon: '🍔', color: 'from-red-400 to-orange-500' },
  catering: { label: 'Catering Services', icon: '🍱', color: 'from-orange-400 to-red-400' },
  
  // Retail & Commerce
  supermarket: { label: 'Supermarket', icon: '🏬', color: 'from-blue-500 to-indigo-500' },
  boutique: { label: 'Boutique', icon: '👠', color: 'from-purple-400 to-pink-400' },
  jewelry: { label: 'Jewelry & Accessories', icon: '💎', color: 'from-violet-500 to-purple-500' },
  toys: { label: 'Toys & Games', icon: '🧸', color: 'from-pink-400 to-red-400' },
  pets: { label: 'Pet Shop & Supplies', icon: '🐕', color: 'from-orange-400 to-amber-500' },
  
  // Automotive
  automotive: { label: 'Automotive & Parts', icon: '🚗', color: 'from-slate-500 to-gray-600' },
  carwash: { label: 'Car Wash & Detailing', icon: '🚿', color: 'from-sky-400 to-blue-500' },
  
  // Health & Wellness
  gym: { label: 'Gym & Fitness Center', icon: '🏋️', color: 'from-red-500 to-orange-600' },
  spa: { label: 'Spa & Wellness', icon: '💆', color: 'from-teal-400 to-cyan-500' },
  clinic: { label: 'Clinic & Medical', icon: '🏥', color: 'from-red-400 to-pink-500' },
  dental: { label: 'Dental Clinic', icon: '🦷', color: 'from-cyan-400 to-blue-400' },
  
  // Education
  education: { label: 'Education & Training', icon: '🎓', color: 'from-indigo-500 to-purple-500' },
  daycare: { label: 'Daycare & Nursery', icon: '👶', color: 'from-pink-300 to-rose-400' },
  
  // Entertainment
  entertainment: { label: 'Entertainment', icon: '🎬', color: 'from-purple-500 to-pink-600' },
  events: { label: 'Event Planning', icon: '🎉', color: 'from-fuchsia-500 to-pink-500' },
  photography: { label: 'Photography Studio', icon: '📸', color: 'from-gray-500 to-slate-600' },
  
  // Professional Services
  services: { label: 'Services', icon: '⚙️', color: 'from-indigo-500 to-blue-500' },
  consulting: { label: 'Consulting', icon: '💼', color: 'from-gray-600 to-slate-700' },
  legal: { label: 'Legal Services', icon: '⚖️', color: 'from-blue-700 to-indigo-700' },
  accounting: { label: 'Accounting & Finance', icon: '📊', color: 'from-green-600 to-teal-600' },
  realestate: { label: 'Real Estate', icon: '🏡', color: 'from-emerald-500 to-green-600' },
  
  // Construction & Home
  construction: { label: 'Construction & Building', icon: '🏗️', color: 'from-orange-600 to-amber-700' },
  plumbing: { label: 'Plumbing Services', icon: '🔧', color: 'from-blue-500 to-cyan-600' },
  electrical: { label: 'Electrical Services', icon: '💡', color: 'from-yellow-500 to-orange-500' },
  cleaning: { label: 'Cleaning Services', icon: '🧹', color: 'from-sky-400 to-blue-500' },
  
  // Technology
  software: { label: 'Software & Tech', icon: '💾', color: 'from-blue-600 to-indigo-700' },
  telecommunications: { label: 'Telecommunications', icon: '📡', color: 'from-violet-500 to-purple-600' },
  
  // Miscellaneous
  laundry: { label: 'Laundry & Dry Cleaning', icon: '👔', color: 'from-cyan-400 to-blue-500' },
  logistics: { label: 'Logistics & Delivery', icon: '🚚', color: 'from-orange-500 to-red-500' },
  printing: { label: 'Printing Services', icon: '🖨️', color: 'from-gray-500 to-slate-600' },
  artcraft: { label: 'Arts & Crafts', icon: '🎨', color: 'from-purple-400 to-pink-500' },
  florist: { label: 'Florist & Garden', icon: '🌺', color: 'from-pink-400 to-rose-500' },
  
  other: { label: 'Other', icon: '💼', color: 'from-gray-500 to-slate-500' },
} as const