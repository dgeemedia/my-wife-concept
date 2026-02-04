// frontend/app/platform/dashboard/components/Header.tsx
import { Shield, Bell, LogOut } from 'lucide-react'

interface HeaderProps {
  userEmail: string
  pendingRequestsCount: number
  onLogout: () => void
  onNavigateToRequests: () => void
}

export default function Header({ 
  userEmail, 
  pendingRequestsCount, 
  onLogout, 
  onNavigateToRequests 
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {userEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {pendingRequestsCount > 0 && (
              <button
                onClick={onNavigateToRequests}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}