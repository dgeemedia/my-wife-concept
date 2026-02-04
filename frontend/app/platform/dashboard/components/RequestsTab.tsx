// frontend/app/platform/dashboard/components/RequestsTab.tsx
import { AlertCircle, Filter } from 'lucide-react'
import RequestItem from './RequestItem'
import { OnboardingRequest } from '../types'

interface RequestsTabProps {
  requests: OnboardingRequest[]
  onApprove: (requestId: number) => void
  onReject: (requestId: number) => void
  onApproveAndCreate: (request: OnboardingRequest) => void
}

export default function RequestsTab({ 
  requests, 
  onApprove, 
  onReject,
  onApproveAndCreate 
}: RequestsTabProps) {
  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Onboarding Requests</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {['pending', 'approved', 'rejected'].map(status => (
              <span key={status} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {status.charAt(0).toUpperCase() + status.slice(1)}: {statusCounts[status as keyof typeof statusCounts]}
              </span>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No onboarding requests yet</p>
          <p className="text-sm text-gray-500 mt-2">New business requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              onApprove={onApprove}
              onReject={onReject}
              onApproveAndCreate={onApproveAndCreate}
            />
          ))}
        </div>
      )}
    </div>
  )
}