// frontend/app/platform/dashboard/components/SettingsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  User, Lock, UserPlus, Users, Save, Eye, EyeOff, 
  Trash2, Shield, UserCog, Mail, Phone, Building2 
} from 'lucide-react'

interface SettingsUser {
  id: number
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  role: 'super-admin' | 'admin' | 'staff'
  businessId?: number
  active?: boolean
  createdAt: string
}

interface Business {
  id: number
  businessName: string
  slug: string
  isActive: boolean
}

interface SettingsProps {
  currentUser: SettingsUser | null
}

export default function SettingsTab({ currentUser }: SettingsProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'users'>('profile')

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveSection('password')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'password'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Password</span>
          </button>
          
          <button
            onClick={() => setActiveSection('users')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'profile' && <ProfileSettings user={currentUser} />}
      {activeSection === 'password' && <PasswordSettings />}
      {activeSection === 'users' && <UserManagement />}
    </div>
  )
}

// Profile Settings Component
function ProfileSettings({ user }: { user: SettingsUser | null }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || ''
  })
  const [saving, setSaving] = useState(false)

  // Reset form data when user changes
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || ''
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
        setEditing(false)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset to original values
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || ''
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Profile Settings</h3>
            <p className="text-sm text-blue-100">Update your personal information</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// Password Settings Component
function PasswordSettings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully')
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        throw new Error(data.error || 'Failed to change password')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Change Password</h3>
            <p className="text-sm text-purple-100">Update your account security</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{saving ? 'Changing Password...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

// User Management Component
function UserManagement() {
  const [users, setUsers] = useState<SettingsUser[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'admin' as 'super-admin' | 'admin',
    businessId: '' // Added for business selection
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchBusinesses()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        // Only show super-admins and admins
        setUsers(data.filter((u: SettingsUser) => u.role === 'super-admin' || u.role === 'admin'))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.filter((b: Business) => b.isActive))
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const payload: any = {
        email: createForm.email,
        password: createForm.password,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        phone: createForm.phone,
        role: createForm.role
      }

      // Only add businessId if role is admin and a business is selected
      if (createForm.role === 'admin' && createForm.businessId) {
        payload.businessId = parseInt(createForm.businessId)
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(`${createForm.role === 'super-admin' ? 'Super Admin' : 'Admin'} user created successfully`)
        setShowCreateModal(false)
        setCreateForm({ 
          email: '', 
          password: '', 
          firstName: '', 
          lastName: '', 
          phone: '', 
          role: 'admin',
          businessId: '' 
        })
        fetchUsers()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (userId: number, currentStatus: boolean | undefined) => {
    try {
      // Default to true if undefined (assume active)
      const isActive = currentStatus ?? true
      const action = isActive ? 'suspend' : 'activate'
      
      const response = await fetch(`/api/users/${userId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success(`User ${isActive ? 'suspended' : 'activated'} successfully`)
        fetchUsers()
      } else {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${action} user`)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">User Management</h3>
              <p className="text-sm text-green-100">Manage admin accounts</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No admin users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 ${
                    user.role === 'super-admin' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  } flex items-center justify-center`}>
                    {user.role === 'super-admin' ? (
                      <Shield className="w-6 h-6 text-white" />
                    ) : (
                      <UserCog className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 truncate">{user.email}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        user.role === 'super-admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                      </span>
                      {user.active === false && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          Suspended
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(user.id, user.active)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (user.active ?? true)
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {(user.active ?? true) ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Create New User</h3>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any, businessId: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="admin">Admin (For specific businesses)</option>
                  <option value="super-admin">Super Admin (Platform-wide)</option>
                </select>
              </div>

              {/* Business Selection - Only show for admin role */}
              {createForm.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Assign to Business (Optional)
                  </label>
                  <select
                    value={createForm.businessId}
                    onChange={(e) => setCreateForm({ ...createForm, businessId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a business (optional)</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.businessName} ({business.slug})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to assign later, or select a business to grant immediate access
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creating ? 'Creating...' : 'Create User'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}