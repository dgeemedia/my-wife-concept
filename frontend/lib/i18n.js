// ============================================================================
// frontend/lib/i18n.js - Multi-Language Support
// ============================================================================
'use client';

import React from 'react';

export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    rtl: false,
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
  },
  zh: {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    rtl: false,
  },
  ig: {
    code: 'ig',
    name: 'Igbo',
    flag: '🇳🇬',
    rtl: false,
  },
  yo: {
    code: 'yo',
    name: 'Yorùbá',
    flag: '🇳🇬',
    rtl: false,
  },
  ha: {
    code: 'ha',
    name: 'Hausa',
    flag: '🇳🇬',
    rtl: false,
  },
};

export const translations = {
  // English
  en: {
    // Navigation
    home: 'Home',
    cart: 'Cart',
    admin: 'Admin',
    logout: 'Logout',
    
    // Home page
    heroTitle: 'Delicious Local Foods',
    heroSubtitle: 'Freshly cooked meals delivered to your door',
    browseMenu: 'Browse Menu',
    ourMenu: 'Our Menu',
    addToCart: 'Add to Cart',
    orderViaWhatsApp: 'WhatsApp',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    
    // Cart page
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    checkout: 'Checkout',
    customerDetails: 'Customer Details',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    email: 'Email (optional)',
    deliveryAddress: 'Delivery Address',
    specialInstructions: 'Special Instructions (optional)',
    proceedToWhatsApp: 'Proceed to WhatsApp',
    total: 'Total',
    
    // Order tracking
    trackOrder: 'Track Your Order',
    orderStatus: 'Order Status',
    orderReceived: 'Order Received',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    outForDelivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    price: 'Price',
    quantity: 'Quantity',
    remove: 'Remove',
  },

  // French
  fr: {
    home: 'Accueil',
    cart: 'Panier',
    admin: 'Admin',
    logout: 'Déconnexion',
    
    heroTitle: 'Délicieuse Cuisine Locale',
    heroSubtitle: 'Repas frais livrés à votre porte',
    browseMenu: 'Voir le Menu',
    ourMenu: 'Notre Menu',
    addToCart: 'Ajouter au Panier',
    orderViaWhatsApp: 'WhatsApp',
    inStock: 'En stock',
    outOfStock: 'Rupture de stock',
    
    yourCart: 'Votre Panier',
    cartEmpty: 'Votre panier est vide',
    continueShopping: 'Continuer vos Achats',
    checkout: 'Commander',
    customerDetails: 'Détails du Client',
    fullName: 'Nom Complet',
    phoneNumber: 'Numéro de Téléphone',
    email: 'Email (optionnel)',
    deliveryAddress: 'Adresse de Livraison',
    specialInstructions: 'Instructions Spéciales (optionnel)',
    proceedToWhatsApp: 'Continuer sur WhatsApp',
    total: 'Total',
    
    trackOrder: 'Suivre Votre Commande',
    orderStatus: 'État de la Commande',
    orderReceived: 'Commande Reçue',
    confirmed: 'Confirmée',
    preparing: 'En Préparation',
    outForDelivery: 'En Livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    price: 'Prix',
    quantity: 'Quantité',
    remove: 'Retirer',
  },

  // German
  de: {
    home: 'Startseite',
    cart: 'Warenkorb',
    admin: 'Admin',
    logout: 'Abmelden',
    
    heroTitle: 'Köstliche Lokale Speisen',
    heroSubtitle: 'Frisch gekochte Mahlzeiten an Ihre Tür geliefert',
    browseMenu: 'Menü Durchsuchen',
    ourMenu: 'Unser Menü',
    addToCart: 'In den Warenkorb',
    orderViaWhatsApp: 'WhatsApp',
    inStock: 'Auf Lager',
    outOfStock: 'Nicht auf Lager',
    
    yourCart: 'Ihr Warenkorb',
    cartEmpty: 'Ihr Warenkorb ist leer',
    continueShopping: 'Weiter Einkaufen',
    checkout: 'Zur Kasse',
    customerDetails: 'Kundendetails',
    fullName: 'Vollständiger Name',
    phoneNumber: 'Telefonnummer',
    email: 'E-Mail (optional)',
    deliveryAddress: 'Lieferadresse',
    specialInstructions: 'Spezielle Anweisungen (optional)',
    proceedToWhatsApp: 'Weiter zu WhatsApp',
    total: 'Gesamt',
    
    trackOrder: 'Bestellung Verfolgen',
    orderStatus: 'Bestellstatus',
    orderReceived: 'Bestellung Erhalten',
    confirmed: 'Bestätigt',
    preparing: 'Wird Vorbereitet',
    outForDelivery: 'Unterwegs',
    delivered: 'Geliefert',
    cancelled: 'Storniert',
    
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    price: 'Preis',
    quantity: 'Menge',
    remove: 'Entfernen',
  },

  // Chinese
  zh: {
    home: '首页',
    cart: '购物车',
    admin: '管理',
    logout: '登出',
    
    heroTitle: '美味本地美食',
    heroSubtitle: '新鲜烹制的餐点送到您家门口',
    browseMenu: '浏览菜单',
    ourMenu: '我们的菜单',
    addToCart: '加入购物车',
    orderViaWhatsApp: 'WhatsApp',
    inStock: '有货',
    outOfStock: '缺货',
    
    yourCart: '您的购物车',
    cartEmpty: '您的购物车是空的',
    continueShopping: '继续购物',
    checkout: '结账',
    customerDetails: '客户详情',
    fullName: '全名',
    phoneNumber: '电话号码',
    email: '电子邮件（可选）',
    deliveryAddress: '配送地址',
    specialInstructions: '特殊说明（可选）',
    proceedToWhatsApp: '前往 WhatsApp',
    total: '总计',
    
    trackOrder: '追踪您的订单',
    orderStatus: '订单状态',
    orderReceived: '已收到订单',
    confirmed: '已确认',
    preparing: '准备中',
    outForDelivery: '配送中',
    delivered: '已送达',
    cancelled: '已取消',
    
    loading: '加载中...',
    error: '错误',
    success: '成功',
    price: '价格',
    quantity: '数量',
    remove: '删除',
  },

  // Igbo
  ig: {
    home: 'Ụlọ',
    cart: 'Akpa Azụmahịa',
    admin: 'Onye Nchịkwa',
    logout: 'Pụọ',
    
    heroTitle: 'Nri Mpaghara Dị Ụtọ',
    heroSubtitle: 'Nri siri ọhụrụ e wetara n\'ọnụ ụzọ gị',
    browseMenu: 'Lee Menu',
    ourMenu: 'Menu Anyị',
    addToCart: 'Tinye n\'Akpa',
    orderViaWhatsApp: 'WhatsApp',
    inStock: 'Dị n\'ụlọ',
    outOfStock: 'Agwụla',
    
    yourCart: 'Akpa Azụmahịa Gị',
    cartEmpty: 'Akpa azụmahịa gị tọgbọrọ chakoo',
    continueShopping: 'Gaa n\'ihu ịzụ ahịa',
    checkout: 'Kwụọ Ụgwọ',
    customerDetails: 'Nkọwa Onye Ahịa',
    fullName: 'Aha Zuru Ezu',
    phoneNumber: 'Nọmba Ekwentị',
    email: 'Email (nhọrọ)',
    deliveryAddress: 'Adreesị Nnyefe',
    specialInstructions: 'Ntuziaka Pụrụ Iche (nhọrọ)',
    proceedToWhatsApp: 'Gaa WhatsApp',
    total: 'Ngụkọta',
    
    trackOrder: 'Chọta Ọrụ Gị',
    orderStatus: 'Ọnọdụ Ọrụ',
    orderReceived: 'Enwetara Ọrụ',
    confirmed: 'Kwadoro',
    preparing: 'Na-akwadebe',
    outForDelivery: 'Na-ebufe',
    delivered: 'Enyefere',
    cancelled: 'Kagburu',
    
    loading: 'Na-ebu...',
    error: 'Njehie',
    success: 'Ihe ịga nke ọma',
    price: 'Ọnụ ahịa',
    quantity: 'Ọnụọgụgụ',
    remove: 'Wepụ',
  },

  // Yoruba
  yo: {
    home: 'Ilé',
    cart: 'Àpò Ọjà',
    admin: 'Olùṣàkóso',
    logout: 'Jáde',
    
    heroTitle: 'Oúnjẹ Àdúgbò Tó Dùn',
    heroSubtitle: 'Oúnjẹ tuntun tí a dána fún ọ títí dé ẹnu-ọ̀nà rẹ',
    browseMenu: 'Wo Àtòjọ Oúnjẹ',
    ourMenu: 'Àtòjọ Oúnjẹ Wa',
    addToCart: 'Fi Sínú Àpò',
    orderViaWhatsApp: 'WhatsApp',
    inStock: 'Wà nílé',
    outOfStock: 'Kò sí',
    
    yourCart: 'Àpò Ọjà Rẹ',
    cartEmpty: 'Àpò ọjà rẹ ṣófo',
    continueShopping: 'Tẹ̀síwájú Rírà',
    checkout: 'Sanwó',
    customerDetails: 'Àlàyé Oníbàárà',
    fullName: 'Orúkọ Kíkún',
    phoneNumber: 'Nọ́mbà Fóònù',
    email: 'Ímeèlì (àṣàyàn)',
    deliveryAddress: 'Adírẹ́ẹ̀sì Ìfíránṣẹ́',
    specialInstructions: 'Ìtọ́nisọ́nà Pàtàkì (àṣàyàn)',
    proceedToWhatsApp: 'Lọ sí WhatsApp',
    total: 'Àpapọ̀',
    
    trackOrder: 'Tọpa Ìbéèrè Rẹ',
    orderStatus: 'Ipò Ìbéèrè',
    orderReceived: 'A ti Gba Ìbéèrè',
    confirmed: 'A ti Jẹ́rìísí',
    preparing: 'Ń múra',
    outForDelivery: 'Ń lọ fíránṣẹ́',
    delivered: 'A ti Fíránṣẹ́',
    cancelled: 'A ti Fagi',
    
    loading: 'Ń gbé wọlé...',
    error: 'Àṣìṣe',
    success: 'Àṣeyọrí',
    price: 'Iye Owó',
    quantity: 'Ìwọ̀n',
    remove: 'Yọkúrò',
  },

  // Hausa
  ha: {
    home: 'Gida',
    cart: 'Jakar Sayayya',
    admin: 'Mai Gudanarwa',
    logout: 'Fita',
    
    heroTitle: 'Abinci Mai Dadi Na Gida',
    heroSubtitle: 'Abinci sabo da ake kawo muku har ƙofar gida',
    browseMenu: 'Duba Lissafin Abinci',
    ourMenu: 'Lissafin Abincinmu',
    addToCart: 'Saka a Jaka',
    orderViaWhatsApp: 'WhatsApp',
    inStock: 'Yana samuwa',
    outOfStock: 'Ba ya samuwa',
    
    yourCart: 'Jakar Sayayya Ku',
    cartEmpty: 'Jakar sayayya ku babu komai',
    continueShopping: 'Ci gaba da Sayayya',
    checkout: 'Biya Kuɗi',
    customerDetails: 'Bayanan Abokin Ciniki',
    fullName: 'Cikakken Suna',
    phoneNumber: 'Lambar Waya',
    email: 'Imel (zaɓi)',
    deliveryAddress: 'Adireshin Isarwa',
    specialInstructions: 'Umarni Na Musamman (zaɓi)',
    proceedToWhatsApp: 'Ci gaba zuwa WhatsApp',
    total: 'Jimla',
    
    trackOrder: 'Bi Diddigin Odar Ku',
    orderStatus: 'Matsayin Oda',
    orderReceived: 'An Karɓi Odar',
    confirmed: 'An Tabbatar',
    preparing: 'Ana Shirya',
    outForDelivery: 'Ana Isarwa',
    delivered: 'An Isar',
    cancelled: 'An Soke',
    
    loading: 'Ana ɗorawa...',
    error: 'Kuskure',
    success: 'Nasara',
    price: 'Farashi',
    quantity: 'Adadi',
    remove: 'Cire',
  },
};

// Extended currency list with West African and Asian countries
export const extendedCurrencies = {
  // Existing
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', countries: ['Nigeria'] },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', countries: ['United States'] },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', countries: ['United Kingdom'] },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', countries: ['Germany', 'France', 'Italy'] },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', countries: ['Ghana'] },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', countries: ['Kenya'] },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', countries: ['South Africa'] },
  
  // West African additions
  XOF: { 
    code: 'XOF', 
    name: 'West African CFA Franc', 
    symbol: 'CFA', 
    countries: ['Benin', 'Togo', 'Burkina Faso', 'Senegal', 'Mali', 'Niger', 'Ivory Coast'] 
  },
  
  // Asian currencies
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', countries: ['China'] },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', countries: ['Japan'] },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', countries: ['India'] },
  
  // Other African
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', countries: ['Egypt'] },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', countries: ['Tanzania'] },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', countries: ['Uganda'] },
};

// Translation utility
export const useTranslation = () => {
  const [language, setLanguage] = React.useState('en');

  React.useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      // Update HTML lang attribute
      document.documentElement.lang = lang;
    }
  };

  return { t, language, changeLanguage, languages };
};

export default { translations, languages, extendedCurrencies, useTranslation };