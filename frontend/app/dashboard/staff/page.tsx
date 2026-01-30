// app/dashboard/staff/page.tsx (UPDATED)
'use client'

import { useEffect, useState } from 'react'
import { Plus, Mail, User, Phone, Shield, Trash2, Ban, CheckCircle } from 'lucide-react'
import { User as UserType } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'staff'
  })

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get('/auth/me')
      setCurrentUser(data.user)
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await api.get('/users')
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await api.post('/users', formData)
      toast.success('Staff member added successfully')
      setShowModal(false)
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'staff'
      })
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add staff member')
    }
  }

  const handleDelete = async (id: number, user: UserType) => {
    // Check if trying to delete super-admin as admin
    if (currentUser?.role === 'admin' && user.role === 'super-admin') {
      toast.error('Admin cannot delete super-admin')
      return
    }

    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) return

    try {
      await api.delete(`/users/${id}`)
      toast.success('Staff member deleted')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete staff member')
    }
  }

  const handleSuspend = async (id: number, user: UserType) => {
    // Check if trying to suspend super-admin as admin
    if (currentUser?.role === 'admin' && user.role === 'super-admin') {
      toast.error('Admin cannot suspend super-admin')
      return
    }

    if (!confirm(`Are you sure you want to ${user.active ? 'suspend' : 'reactivate'} ${user.firstName} ${user.lastName}?`)) return

    try {
      if (user.active) {
        await api.post(`/users/${id}/suspend`, {})
        toast.success('Staff member suspended')
      } else {
        await api.post(`/users/${id}/reactivate`, {})
        toast.success('Staff member reactivated')
      }
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || `Failed to ${user.active ? 'suspend' : 'reactivate'} staff member`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Check if current user can create staff
  const canCreateStaff = currentUser?.role === 'super-admin' || currentUser?.role === 'admin'

  // Check if user can manage target user
  const canManageUser = (targetUser: UserType) => {
    if (currentUser?.role === 'super-admin') return true
    if (currentUser?.role === 'admin' && targetUser.role !== 'super-admin') return true
    return false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage your staff members</p>
        </div>
        {canCreateStaff && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Staff
          </button>
        )}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'super-admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                user.active ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.role === 'super-admin' ? 'Super Admin' : 
                 user.role === 'admin' ? 'Admin' :
                 user.active ? 'Active' : 'Suspended'}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-gray-400 mr-2" />
                <span className="capitalize">{user.role.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              {canManageUser(user) && (
                <div className="flex gap-2">
                  {/* Suspend/Reactivate Button */}
                  <button
                    onClick={() => handleSuspend(user.id, user)}
                    className={`p-2 rounded-lg ${
                      user.active 
                        ? 'text-orange-600 hover:bg-orange-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={user.active ? 'Suspend' : 'Reactivate'}
                  >
                    {user.active ? <Ban size={16} /> : <CheckCircle size={16} />}
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(user.id, user)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No staff members yet</p>
          {canCreateStaff && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Add your first staff member
            </button>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">Add Staff Member</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  {/* Super-admin can only be created by super-admin */}
                  {currentUser?.role === 'super-admin' && (
                    <option value="super-admin">Super Admin</option>
                  )}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {currentUser?.role === 'admin' && 'Note: You cannot create super-admin accounts'}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}