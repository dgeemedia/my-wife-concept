// frontend/app/platform/dashboard/components/RequestItem.tsx
import { Check, X, Plus, Calendar, User, Mail, Phone, Globe } from 'lucide-react'
import { OnboardingRequest } from '../types'

interface RequestItemProps {
  request: OnboardingRequest
  onApprove: (requestId: number) => void
  onReject: (requestId: number) => void
  onApproveAndCreate: (request: OnboardingRequest) => void
}

export default function RequestItem({ 
  request, 
  onApprove, 
  onReject,
  onApproveAndCreate 
}: RequestItemProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusIcons = {
    pending: '⏳',
    approved: '✅',
    rejected: '❌'
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                <span className="mr-1">{statusIcons[request.status]}</span>
                {request.status.toUpperCase()}
              </div>
              {request.isRecent && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                  NEW
                </span>
              )}
              {request.daysSinceCreation && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {request.daysSinceCreation} day{request.daysSinceCreation !== 1 ? 's' : ''} ago
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">{request.businessName}</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700"><strong>Owner:</strong> {request.ownerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700"><strong>Email:</strong> {request.ownerEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700"><strong>Phone:</strong> {request.ownerPhone}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4">🏢</span>
                  <span className="text-sm text-gray-700"><strong>Type:</strong> {request.businessType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <strong>Slug:</strong> {request.preferredSlug || 'auto-generate'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <strong>Submitted:</strong> {request.formattedCreatedAt || new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {request.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Description:</strong> {request.description}
                </p>
              </div>
            )}
            
            {request.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  <strong className="text-red-900">Rejection Reason:</strong> {request.rejectionReason}
                </p>
              </div>
            )}
          </div>
          
          <div className="ml-6 flex flex-col space-y-2">
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(request.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-40"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-40"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}
            {request.status === 'approved' && !request.adminCreated && (
              <button
                onClick={() => onApproveAndCreate(request)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-40"
              >
                <Plus className="w-4 h-4" />
                <span>Create Business</span>
              </button>
            )}
            {request.status === 'approved' && request.adminCreated && (
              <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 w-40">
                <p className="text-sm text-gray-600 text-center">
                  Business created ✓
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}