// frontend/components/dashboard/NotificationPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Package, DollarSign, AlertCircle, CheckCircle, Archive, ChevronLeft } from 'lucide-react'
import api from '@/lib/api'

interface Notification {
  id: number
  type: 'order' | 'payment' | 'stock' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
  orderId?: number
  productId?: number
}

type ViewMode = 'active' | 'archived'

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [archivedCount, setArchivedCount] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('active')

  useEffect(() => {
    if (show) {
      fetchNotifications()
    }
  }, [show, viewMode])

  useEffect(() => {
    // Initial fetch and polling for active notifications only
    if (viewMode === 'active') {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [viewMode])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      if (viewMode === 'archived') {
        const response = await api.get('/notifications/archived')
        
        if (response.notifications) {
          const formattedNotifications = response.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.createdAt)
          }))
          
          setNotifications(formattedNotifications)
        }
      } else {
        const response = await api.get('/notifications')
        
        if (response.notifications) {
          const formattedNotifications = response.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.createdAt)
          }))
          
          setNotifications(formattedNotifications)
          setUnreadCount(response.unreadCount || 0)
          setArchivedCount(response.archivedCount || 0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all')
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && viewMode === 'active') {
      markAsRead(notification.id)
    }
    setShow(false)
  }

  const switchToArchived = () => {
    setViewMode('archived')
  }

  const switchToActive = () => {
    setViewMode('active')
  }

  return (
    <div className="relative">
      {/* Bell Icon with Numeric Badge */}
      <button
        onClick={() => setShow(!show)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
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
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {viewMode === 'archived' && (
                    <button
                      onClick={switchToActive}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <Bell className="w-5 h-5" />
                  <h3 className="font-semibold">
                    {viewMode === 'archived' ? 'Archived' : 'Notifications'}
                  </h3>
                  {viewMode === 'active' && unreadCount > 0 && (
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

              {/* View Mode Toggle */}
              {viewMode === 'active' && archivedCount > 0 && (
                <button
                  onClick={switchToArchived}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    <span>View Archived</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {archivedCount} archived
                  </span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  {viewMode === 'archived' ? (
                    <>
                      <Archive className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No archived notifications</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Notifications older than 30 days appear here
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No new notifications</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notification => (
                    <a
                      key={notification.id}
                      href={notification.link || '#'}
                      onClick={() => handleNotificationClick(notification)}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read && viewMode === 'active' ? 'bg-blue-50' : ''
                      } ${viewMode === 'archived' ? 'opacity-75' : ''}`}
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
                            {!notification.read && viewMode === 'active' && (
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
            {notifications.length > 0 && viewMode === 'active' && unreadCount > 0 && (
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