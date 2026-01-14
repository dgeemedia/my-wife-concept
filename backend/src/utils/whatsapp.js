// backend/src/utils/whatsapp.js
/**
 * Format WhatsApp message for order
 */
function formatOrderMessage(order) {
  const items = order.items
    .map(
      (item) =>
        `${item.product.name} x${item.quantity} - ₦${(item.unitPrice * item.quantity).toLocaleString()}`
    )
    .join('\n');

  // ADD THIS: Generate tracking URL
  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${order.id}?phone=${order.phone}`;

  const message = `
🛒 *New Order #${order.id}*

*Customer Details:*
Name: ${order.customerName}
Phone: ${order.phone}
${order.email ? `Email: ${order.email}` : ''}
${order.address ? `Address: ${order.address}` : ''}
${order.message ? `Message: ${order.message}` : ''}

*Items:*
${items}

*Total: ₦${order.totalAmount.toLocaleString()}*

Order Date: ${new Date(order.createdAt).toLocaleString()}

📦 *Track Order:*
${trackingUrl}
  `.trim();

  return message;
}

/**
 * Create WhatsApp link
 */
function createWhatsAppLink(phoneNumber, message) {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Format simple product order message
 */
function formatSimpleOrderMessage(product, quantity, customerInfo) {
  const { customerName, phone, address, email, message } = customerInfo;

  return `
🛒 *New Order*

*Customer Details:*
Name: ${customerName}
Phone: ${phone}
${email ? `Email: ${email}` : ''}
${address ? `Address: ${address}` : ''}
${message ? `Message: ${message}` : ''}

*Order:*
${product.name} x${quantity}
Price: ₦${product.price.toLocaleString()}
Total: ₦${(product.price * quantity).toLocaleString()}
  `.trim();
}

module.exports = {
  formatOrderMessage,
  createWhatsAppLink,
  formatSimpleOrderMessage,
};
