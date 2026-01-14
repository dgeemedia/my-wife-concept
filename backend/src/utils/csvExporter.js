// backend/src/utils/csvExporter.js
const { Parser } = require('json2csv');

/**
 * Export orders to CSV
 */
function exportOrdersToCsv(orders) {
  // Flatten orders for CSV
  const rows = orders.flatMap((order) =>
    order.items.map((item) => ({
      orderId: order.id,
      orderDate: order.createdAt,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email || '',
      address: order.address || '',
      message: order.message || '',
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotal: item.quantity * item.unitPrice,
      orderTotal: order.totalAmount,
    }))
  );

  const fields = [
    'orderId',
    'orderDate',
    'customerName',
    'phone',
    'email',
    'address',
    'message',
    'productName',
    'quantity',
    'unitPrice',
    'itemTotal',
    'orderTotal',
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(rows);

  return csv;
}

/**
 * Export products to CSV
 */
function exportProductsToCsv(products) {
  const fields = ['id', 'name', 'price', 'stock', 'description', 'createdAt'];

  const parser = new Parser({ fields });
  const csv = parser.parse(products);

  return csv;
}

/**
 * Set CSV download headers
 */
function setCsvHeaders(res, filename) {
  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
}

module.exports = {
  exportOrdersToCsv,
  exportProductsToCsv,
  setCsvHeaders,
};
