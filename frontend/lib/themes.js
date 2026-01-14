// frontend/lib/themes.js
// Multi-business theme customization system

/**
 * Business-specific theme configurations
 */
export const businessThemes = {
  food: {
    name: 'Food & Restaurant',
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4',
    accentColor: '#FFE66D',
    backgroundColor: '#FFF8F0',
    textColor: '#2C3E50',
    emoji: '🍲',
    heroImage: '/themes/food-hero.jpg',
    font: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif',
    },
    styles: {
      buttonStyle: 'rounded-full',
      cardStyle: 'shadow-lg rounded-xl',
      borderRadius: '12px',
    },
  },
  
  fashion: {
    name: 'Fashion & Boutique',
    primaryColor: '#E91E63',
    secondaryColor: '#9C27B0',
    accentColor: '#FFC107',
    backgroundColor: '#FAF3F3',
    textColor: '#212121',
    emoji: '👗',
    heroImage: '/themes/fashion-hero.jpg',
    font: {
      heading: 'Playfair Display, serif',
      body: 'Montserrat, sans-serif',
    },
    styles: {
      buttonStyle: 'rounded-md',
      cardStyle: 'shadow-md border border-gray-200',
      borderRadius: '8px',
    },
  },
  
  electronics: {
    name: 'Electronics & Tech',
    primaryColor: '#2196F3',
    secondaryColor: '#00BCD4',
    accentColor: '#FFC107',
    backgroundColor: '#F5F9FC',
    textColor: '#263238',
    emoji: '📱',
    heroImage: '/themes/electronics-hero.jpg',
    font: {
      heading: 'Roboto, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    styles: {
      buttonStyle: 'rounded-lg',
      cardStyle: 'shadow-sm border-2 border-blue-100',
      borderRadius: '10px',
    },
  },
  
  pharmacy: {
    name: 'Pharmacy & Healthcare',
    primaryColor: '#4CAF50',
    secondaryColor: '#009688',
    accentColor: '#CDDC39',
    backgroundColor: '#F1F8F4',
    textColor: '#1B5E20',
    emoji: '💊',
    heroImage: '/themes/pharmacy-hero.jpg',
    font: {
      heading: 'Lato, sans-serif',
      body: 'Nunito, sans-serif',
    },
    styles: {
      buttonStyle: 'rounded-md',
      cardStyle: 'shadow-md border-l-4 border-green-500',
      borderRadius: '6px',
    },
  },
  
  general: {
    name: 'General Store',
    primaryColor: '#673AB7',
    secondaryColor: '#FF5722',
    accentColor: '#FFC107',
    backgroundColor: '#FAFAFA',
    textColor: '#212121',
    emoji: '🛍️',
    heroImage: '/themes/general-hero.jpg',
    font: {
      heading: 'Ubuntu, sans-serif',
      body: 'Roboto, sans-serif',
    },
    styles: {
      buttonStyle: 'rounded-lg',
      cardStyle: 'shadow-md',
      borderRadius: '8px',
    },
  },
};

/**
 * Get theme for business type
 */
export const getTheme = (businessType = 'general') => {
  return businessThemes[businessType] || businessThemes.general;
};

/**
 * Apply theme to document
 */
export const applyTheme = (businessType = 'general') => {
  if (typeof window === 'undefined') return;
  
  const theme = getTheme(businessType);
  const root = document.documentElement;
  
  // Set CSS custom properties
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--border-radius', theme.styles.borderRadius);
  root.style.setProperty('--font-heading', theme.font.heading);
  root.style.setProperty('--font-body', theme.font.body);
};

/**
 * Get business-specific copy/text
 */
export const getBusinessCopy = (businessType = 'general') => {
  const copy = {
    food: {
      heroTitle: 'Delicious Meals Delivered Fresh',
      heroSubtitle: 'Order your favorite local dishes with just a few clicks',
      ctaButton: 'View Menu',
      productLabel: 'Menu',
      orderButton: 'Order Now',
      addToCart: 'Add to Cart',
    },
    fashion: {
      heroTitle: 'Style That Speaks to You',
      heroSubtitle: 'Discover trending fashion pieces for every occasion',
      ctaButton: 'Shop Collection',
      productLabel: 'Collection',
      orderButton: 'Buy Now',
      addToCart: 'Add to Bag',
    },
    electronics: {
      heroTitle: 'Latest Tech at Your Fingertips',
      heroSubtitle: 'Find the newest gadgets and electronics',
      ctaButton: 'Browse Products',
      productLabel: 'Products',
      orderButton: 'Order Now',
      addToCart: 'Add to Cart',
    },
    pharmacy: {
      heroTitle: 'Your Health, Our Priority',
      heroSubtitle: 'Quality medications and healthcare products delivered',
      ctaButton: 'Shop Healthcare',
      productLabel: 'Products',
      orderButton: 'Order Now',
      addToCart: 'Add to Cart',
    },
    general: {
      heroTitle: 'Everything You Need in One Place',
      heroSubtitle: 'Shop quality products with fast delivery',
      ctaButton: 'Start Shopping',
      productLabel: 'Products',
      orderButton: 'Order Now',
      addToCart: 'Add to Cart',
    },
  };
  
  return copy[businessType] || copy.general;
};

/**
 * Generate theme CSS variables
 */
export const generateThemeCSS = (businessType = 'general') => {
  const theme = getTheme(businessType);
  
  return `
    :root {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor};
      --color-accent: ${theme.accentColor};
      --color-background: ${theme.backgroundColor};
      --color-text: ${theme.textColor};
      --border-radius: ${theme.styles.borderRadius};
      --font-heading: ${theme.font.heading};
      --font-body: ${theme.font.body};
    }
  `;
};

/**
 * Get WhatsApp message template based on business type
 */
export const getWhatsAppTemplate = (businessType = 'general') => {
  const templates = {
    food: {
      greeting: '🍽️ *New Food Order*',
      itemPrefix: '🍲',
    },
    fashion: {
      greeting: '👗 *New Fashion Order*',
      itemPrefix: '👕',
    },
    electronics: {
      greeting: '📱 *New Electronics Order*',
      itemPrefix: '⚡',
    },
    pharmacy: {
      greeting: '💊 *New Healthcare Order*',
      itemPrefix: '💉',
    },
    general: {
      greeting: '🛍️ *New Order*',
      itemPrefix: '📦',
    },
  };
  
  return templates[businessType] || templates.general;
};

export default {
  getTheme,
  applyTheme,
  getBusinessCopy,
  generateThemeCSS,
  getWhatsAppTemplate,
  businessThemes,
};
