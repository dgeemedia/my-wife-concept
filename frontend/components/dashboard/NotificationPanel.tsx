// frontend/components/dashboard/NotificationPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

interface Notification {
  id: string
  type: 'order' | 'payment' | 'stock' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
}

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Fetch recent orders for notifications
      const ordersResponse = await api.get('/orders?limit=10')
      const orders = ordersResponse.orders || []
      
      // Fetch products for stock notifications
      const products = await api.get('/products')
      
      const newNotifications: Notification[] = []
      
      // Check for new pending orders
      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING')
      pendingOrders.forEach((order: any) => {
        newNotifications.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order',
          message: `Order #${order.id} from ${order.customerName}`,
          timestamp: new Date(order.createdAt),
          read: false,
          link: `/dashboard/orders/${order.id}`
        })
      })
      
      // Check for pending payments
      const pendingPayments = orders.filter((o: any) => o.paymentStatus === 'PENDING')
      pendingPayments.slice(0, 3).forEach((order: any) => {
        newNotifications.push({
          id: `payment-${order.id}`,
          type: 'payment',
          title: 'Payment Pending',
          message: `Order #${order.id} awaiting payment confirmation`,
          timestamp: new Date(order.createdAt),
          read: false,
          link: `/dashboard/orders/${order.id}`
        })
      })
      
      // Check for low stock
      const lowStock = products.filter((p: any) => p.stock > 0 && p.stock < 5)
      lowStock.forEach((product: any) => {
        newNotifications.push({
          id: `stock-${product.id}`,
          type: 'stock',
          title: 'Low Stock Alert',
          message: `${product.name} has only ${product.stock} items left`,
          timestamp: new Date(),
          read: false,
          link: `/dashboard/products`
        })
      })
      
      // Sort by timestamp
      newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      setNotifications(newNotifications.slice(0, 10))
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />
      case 'stock':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShow(!show)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full">
            <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {show && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShow(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShow(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notification => (
                    <a
                      key={notification.id}
                      href={notification.link || '#'}
                      onClick={() => {
                        markAsRead(notification.id)
                        setShow(false)
                      }}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <button
                  onClick={markAllAsRead}
                  className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}