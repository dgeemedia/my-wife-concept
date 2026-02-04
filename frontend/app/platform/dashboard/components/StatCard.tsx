import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: number | string
  bgColor: string
  subLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  change?: string
}

export default function StatCard({ 
  icon, 
  label, 
  value, 
  bgColor, 
  subLabel,
  trend,
  change 
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        {trend && change && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            <span className="mr-1">{trendIcons[trend]}</span>
            {change}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 font-medium mb-1">{label}</div>
      {subLabel && (
        <div className="text-sm text-gray-500">{subLabel}</div>
      )}
    </div>
  )
}