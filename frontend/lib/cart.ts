// frontend/lib/cart.ts
import { Product, CartItem } from '@/types'

const CART_STORAGE_KEY = 'mypadifood_cart'

// Get cart from localStorage
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  
  const cartJson = localStorage.getItem(CART_STORAGE_KEY)
  if (!cartJson) return []
  
  try {
    return JSON.parse(cartJson)
  } catch {
    return []
  }
}

// Save cart to localStorage
export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

// Add item to cart
export function addToCart(product: Product, quantity: number = 1): CartItem[] {
  const cart = getCart()
  const existingIndex = cart.findIndex(item => item.product.id === product.id)
  
  if (existingIndex >= 0) {
    // Update existing item
    cart[existingIndex].quantity += quantity
    if (cart[existingIndex].quantity > product.stock) {
      cart[existingIndex].quantity = product.stock
    }
  } else {
    // Add new item
    cart.push({ product, quantity: Math.min(quantity, product.stock) })
  }
  
  saveCart(cart)
  return cart
}

// Remove item from cart
export function removeFromCart(productId: number): CartItem[] {
  const cart = getCart()
  const newCart = cart.filter(item => item.product.id !== productId)
  saveCart(newCart)
  return newCart
}

// Update item quantity
export function updateQuantity(productId: number, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(productId)
  }
  
  const cart = getCart()
  const itemIndex = cart.findIndex(item => item.product.id === productId)
  
  if (itemIndex >= 0) {
    const product = cart[itemIndex].product
    cart[itemIndex].quantity = Math.min(quantity, product.stock)
    saveCart(cart)
  }
  
  return cart
}

// Clear cart
export function clearCart(): void {
  saveCart([])
}

// Calculate total price
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
}

// Calculate item count
export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}

// Check if cart is valid (all items in stock)
export function validateCart(items: CartItem[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  items.forEach(item => {
    if (item.product.stock === 0) {
      errors.push(`${item.product.name} is out of stock`)
    } else if (item.quantity > item.product.stock) {
      errors.push(`Only ${item.product.stock} ${item.product.name}(s) in stock`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}