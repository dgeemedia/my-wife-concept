// frontend/hooks/useCart.js
/**
 * Custom hook for cart management
 * frontend/hooks/useCart.js
 */
import { useState, useEffect } from 'react';
import { getCart, saveCart, clearCart } from '../lib/cart';

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    setCart(getCart());
    setIsLoading(false);
  }, []);

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate item count
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addItem = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    }

    setCart(newCart);
    saveCart(newCart);
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity);
    
    if (qty <= 0) {
      removeItem(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: qty } : item
    );

    setCart(newCart);
    saveCart(newCart);
  };

  // Remove item from cart
  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    saveCart(newCart);
  };

  // Clear entire cart
  const clear = () => {
    setCart([]);
    clearCart();
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    total,
    itemCount,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    isInCart,
    getItemQuantity,
  };
}