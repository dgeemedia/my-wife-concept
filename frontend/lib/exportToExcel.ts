// frontend/utils/exportToExcel.ts
import { Order } from '@/types'

export function exportOrdersToExcel(orders: Order[], filename: string = 'orders-export') {
  // Create CSV content
  const headers = [
    'Order ID',
    'Customer Name',
    'Phone',
    'Email',
    'Address',
    'Total Amount',
    'Currency',
    'Payment Status',
    'Payment Method',
    'Order Status',
    'Items',
    'Order Date',
    'Payment Confirmed Date'
  ]

  const rows = orders.map(order => [
    order.id,
    order.customerName,
    order.phone,
    order.email || '',
    order.address || '',
    order.totalAmount,
    order.currency,
    order.paymentStatus,
    order.paymentMethod || '',
    order.status,
    order.items?.map(item => `${item.product?.name} x${item.quantity}`).join('; ') || '',
    new Date(order.createdAt).toLocaleString(),
    order.paymentConfirmedAt ? new Date(order.paymentConfirmedAt).toLocaleString() : ''
  ])

  // Convert to CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportCustomersToExcel(orders: Order[], filename: string = 'customers-export') {
  // Extract unique customers
  const customersMap = new Map()
  
  orders.forEach(order => {
    const key = order.phone
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        name: order.customerName,
        phone: order.phone,
        email: order.email || '',
        address: order.address || '',
        totalOrders: 0,
        totalSpent: 0,
        firstOrder: order.createdAt,
        lastOrder: order.createdAt
      })
    }
    
    const customer = customersMap.get(key)
    customer.totalOrders++
    customer.totalSpent += order.totalAmount
    
    if (new Date(order.createdAt) < new Date(customer.firstOrder)) {
      customer.firstOrder = order.createdAt
    }
    if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
      customer.lastOrder = order.createdAt
    }
  })

  const headers = [
    'Customer Name',
    'Phone',
    'Email',
    'Address',
    'Total Orders',
    'Total Spent',
    'First Order',
    'Last Order'
  ]

  const rows = Array.from(customersMap.values()).map(customer => [
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    customer.totalOrders,
    customer.totalSpent,
    new Date(customer.firstOrder).toLocaleDateString(),
    new Date(customer.lastOrder).toLocaleDateString()
  ])

  // Convert to CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
