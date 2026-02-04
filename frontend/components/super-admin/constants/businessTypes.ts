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
  services: { label: 'Services', icon: '⚙️', color: 'from-indigo-500 to-blue-500' },
  other: { label: 'Other', icon: '💼', color: 'from-gray-500 to-slate-500' },
} as const