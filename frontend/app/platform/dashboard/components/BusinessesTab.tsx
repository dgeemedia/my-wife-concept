// frontend/app/platform/dashboard/components/BusinessesTab.tsx
import { Search, Plus } from 'lucide-react'
import { DashboardBusiness } from '../types'

interface BusinessesTabProps {
  businesses: DashboardBusiness[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddBusiness: () => void
  onToggleStatus: (businessId: number, currentStatus: boolean) => void
}

export default function BusinessesTab({
  businesses,
  searchTerm,
  onSearchChange,
  onAddBusiness,
  onToggleStatus
}: BusinessesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search businesses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onAddBusiness}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Business</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {businesses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No businesses found</p>
          </div>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className="p-6 border-b hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {business.businessName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{business.businessName}</h3>
                      {business.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Suspended</span>
                      )}
                      {business.suspendedAt && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Suspended {new Date(business.suspendedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{business.slug}.localhost:3000</p>
                    <p className="text-xs text-gray-500">
                      {business.businessType} • Created {new Date(business.createdAt).toLocaleDateString()}
                    </p>
                    {!business.isActive && business.suspensionReason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {business.suspensionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{business._count?.users || 0}</div>
                    <div className="text-xs text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{business._count?.products || 0}</div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{business._count?.orders || 0}</div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <button
                    onClick={() => onToggleStatus(business.id, business.isActive)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      business.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {business.isActive ? (
                      <>
                        <span className="w-4 h-4">⏸️</span>
                        <span>Suspend</span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4">▶️</span>
                        <span>Reactivate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}