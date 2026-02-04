// frontend/app/platform/dashboard/components/CreateBusinessModal.tsx
import { Plus, X, Mail, Globe, Building2, User, CheckCircle } from 'lucide-react'
import { OnboardingRequest } from '../types'

interface CreateBusinessModalProps {
  request: OnboardingRequest
  onClose: () => void
  onCreate: () => void
}

export default function CreateBusinessModal({ 
  request, 
  onClose, 
  onCreate 
}: CreateBusinessModalProps) {
  const getSlug = () => {
    return request.preferredSlug || request.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }

  const getGeneratedEmail = () => {
    const slug = getSlug()
    return `admin@${slug}.com`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-slideUp">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                Create Business Account
              </h2>
              <p className="text-gray-600 mt-1">Create business from approved request</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Request Info */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">RQ</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Request #{request.id}</p>
                <p className="text-sm text-gray-600">Submitted {formatDate(request.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Business Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{request.businessName}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium capitalize">{request.businessType}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Subdomain URL
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900 font-medium">
                  https://{getSlug()}
                  <span className="text-gray-400">.localhost:3000</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Business owners will access their dashboard here</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-1" />
                Owner Account
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">{request.ownerName}</p>
                    <p className="text-sm text-gray-600">{request.ownerEmail}</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Admin
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Generated Admin Email
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900 font-medium">{getGeneratedEmail()}</p>
                <p className="text-xs text-gray-500 mt-1">System-generated email for business owner</p>
              </div>
            </div>
          </div>

          {/* Description Preview */}
          {request.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Description</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">{request.description}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Create Business Account</span>
            </button>
          </div>

          {/* Info Footer */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 flex items-start">
              <span className="mr-2">📝</span>
              A welcome email with login credentials will be sent to {request.ownerEmail}. The business owner can change their email and password after logging in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}