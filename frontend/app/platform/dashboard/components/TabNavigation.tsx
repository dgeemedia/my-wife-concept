// frontend/app/platform/dashboard/components/TabNavigation.tsx
import { Shield, Building2, AlertCircle, BarChart3, Users, Settings, CreditCard } from 'lucide-react'
import { ActiveTab } from '../types'

interface TabNavigationProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  pendingRequestsCount: number
  expiringSubscriptionsCount?: number
}

export default function TabNavigation({ 
  activeTab, 
  onTabChange, 
  pendingRequestsCount,
  expiringSubscriptionsCount = 0
}: TabNavigationProps) {
  const tabs = [
    { 
      id: 'overview' as const, 
      label: 'Overview', 
      icon: BarChart3,
      description: 'Platform analytics'
    },
    { 
      id: 'businesses' as const, 
      label: 'Businesses', 
      icon: Building2,
      description: 'Manage businesses',
      badge: expiringSubscriptionsCount > 0 ? (
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium border border-yellow-200">
          {expiringSubscriptionsCount} expiring
        </span>
      ) : undefined
    },
    { 
      id: 'requests' as const, 
      label: 'Onboarding', 
      icon: Users,
      description: 'Review requests',
      badge: pendingRequestsCount > 0 ? (
        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium border border-red-200">
          {pendingRequestsCount}
        </span>
      ) : undefined
    }
  ]

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-start px-6 py-4 border-b-2 transition-all duration-200 relative group ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                {/* Main Tab Content */}
                <div className="flex items-center space-x-2 mb-1">
                  <tab.icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span className={`font-medium ${
                    isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {tab.label}
                  </span>
                  {tab.badge}
                </div>
                
                {/* Description */}
                <span className={`text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                }`}>
                  {tab.description}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full" />
                )}
                
                {/* Hover Indicator */}
                <div className="absolute -bottom-px left-1/2 right-1/2 h-0.5 bg-gray-300 group-hover:left-0 group-hover:right-0 transition-all duration-200 rounded-t-full" />
              </button>
            )
          })}
          
          {/* Settings Tab (Optional) */}
          <button
            onClick={() => {/* Add settings functionality */}}
            className="ml-auto flex items-center px-4 py-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}