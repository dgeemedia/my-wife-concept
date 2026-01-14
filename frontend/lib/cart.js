// frontend/lib/cart.js
const KEY = 'food_cart';

/**
 * Get cart from localStorage
 */
export const getCart = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(KEY) || '[]');
};

/**
 * Save cart to localStorage
 */
export const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(cart));
};

/**
 * Add product to cart
 * If it exists, increment quantity
 */
export const addToCart = (product) => {
  const cart = getCart();
  const found = cart.find(i => i.productId === product.id);

  if (found) {
    found.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
  }

  saveCart(cart);
};

/**
 * Update quantity for a cart item
 */
export const updateCartItem = (productId, quantity) => {
  const cart = getCart().map(item =>
    item.productId === productId ? { ...item, quantity } : item
  );
  saveCart(cart);
};

/**
 * Remove item from cart
 */
export const removeFromCart = (productId) => {
  const cart = getCart().filter(item => item.productId !== productId);
  saveCart(cart);
};

/**
 * Clear entire cart
 */
export const clearCart = () => {
  saveCart([]);
};

/**
 * Get cart item count (FIXED - was missing)
 */
export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Format WhatsApp message (FIXED - was missing)
 */
export const formatWhatsAppMessage = (cart, checkoutInfo) => {
  const items = cart.map(item => 
    `${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`
  ).join('\n');
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return `
🛒 *New Order*

*Customer Details:*
Name: ${checkoutInfo.customerName}
Phone: ${checkoutInfo.phone}
Email: ${checkoutInfo.email || 'Not provided'}
Address: ${checkoutInfo.address || 'Not provided'}

*Order Items:*
${items}

*Total: ₦${total.toLocaleString()}*

${checkoutInfo.message ? `\n*Special Instructions:*\n${checkoutInfo.message}` : ''}
`.trim();
};

/**
 * Checkout function with improved error recovery
 */
export const checkoutCart = async (checkoutInfo) => {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348110252143';

  const cart = getCart();
  if (!checkoutInfo.customerName || !checkoutInfo.phone || cart.length === 0) {
    throw new Error('Missing required info or cart is empty');
  }

  const payload = {
    customerName: checkoutInfo.customerName,
    phone: checkoutInfo.phone,
    address: checkoutInfo.address || '',
    email: checkoutInfo.email || '',
    message: checkoutInfo.message || '',
    items: cart.map(i => ({ 
      productId: i.productId, 
      quantity: i.quantity 
    }))
  };

  const res = await fetch(`${backend}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (data.success) {
    const waMessage = formatWhatsAppMessage(cart, checkoutInfo);
    
    // Store order details temporarily in case WhatsApp fails
    sessionStorage.setItem('pending_order', JSON.stringify({
      orderId: data.order.id,
      cart,
      checkoutInfo,
      timestamp: Date.now()
    }));

    // Don't clear cart until user confirms WhatsApp opened
    const confirmed = confirm(
      'Order created successfully!\n\n' +
      'Click OK to open WhatsApp and complete your order.\n' +
      'Your cart will be cleared after confirmation.'
    );

    if (confirmed) {
      window.open(
        `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`,
        '_blank'
      );
      
      // Clear cart only after user confirms
      clearCart();
      sessionStorage.removeItem('pending_order');
      
      return data.order;
    } else {
      throw new Error('Order created but WhatsApp not opened. Your cart is preserved.');
    }
  } else {
    throw new Error(data.error || 'Checkout failed');
  }
};

/**
 * Recover pending order if checkout was interrupted
 */
export const recoverPendingOrder = () => {
  if (typeof window === 'undefined') return null;
  
  const pending = sessionStorage.getItem('pending_order');
  if (!pending) return null;

  try {
    const order = JSON.parse(pending);
    const ageMinutes = (Date.now() - order.timestamp) / (1000 * 60);
    
    // Only recover orders less than 30 minutes old
    if (ageMinutes < 30) {
      return order;
    } else {
      sessionStorage.removeItem('pending_order');
      return null;
    }
  } catch {
    return null;
  }
};