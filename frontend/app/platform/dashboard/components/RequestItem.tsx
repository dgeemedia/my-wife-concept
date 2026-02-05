// frontend/app/platform/dashboard/components/RequestItem.tsx
import { useState } from 'react'
import { Check, X, Plus, Calendar, User, Mail, Phone, Globe, Eye, FileText } from 'lucide-react'
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
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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
    <>
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
                  <p className="text-sm text-gray-700 line-clamp-2">
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
                  {/* View Details Button */}
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-40"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
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

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Onboarding Request Details</h2>
                    <p className="text-blue-100 text-sm">Request #{request.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">Status:</span>
                <div className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[request.status]}`}>
                  <span className="mr-2">{statusIcons[request.status]}</span>
                  {request.status.toUpperCase()}
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Business Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">Business Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{request.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Business Type</label>
                    <p className="text-gray-900 font-semibold mt-1 capitalize">{request.businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Preferred Slug</label>
                    <p className="text-gray-900 font-semibold mt-1">{request.preferredSlug || 'Auto-generate'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Submission Date</label>
                    <p className="text-gray-900 font-semibold mt-1">
                      {request.formattedCreatedAt || new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4">Owner Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Full Name</label>
                    <p className="text-gray-900 font-semibold mt-1">{request.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Email Address</label>
                    <p className="text-gray-900 font-semibold mt-1">{request.ownerEmail}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-green-700">Phone Number</label>
                    <p className="text-gray-900 font-semibold mt-1">{request.ownerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {request.description && (
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-3">Business Description</h3>
                  <p className="text-gray-700 leading-relaxed">{request.description}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Days Since Submission:</strong> {request.daysSinceCreation || 'N/A'} days</p>
                  {request.reviewedAt && (
                    <p><strong>Reviewed At:</strong> {new Date(request.reviewedAt).toLocaleString()}</p>
                  )}
                  {request.reviewedBy && (
                    <p><strong>Reviewed By:</strong> Admin #{request.reviewedBy}</p>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {request.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-red-900 mb-3">Rejection Reason</h3>
                  <p className="text-red-700">{request.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {request.status === 'pending' && (
                <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      onApprove(request.id)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Check className="w-5 h-5" />
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      onReject(request.id)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    <span>Reject Request</span>
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
              {request.status !== 'pending' && (
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}