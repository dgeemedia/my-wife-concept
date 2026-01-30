// frontend/app/dashboard/staff/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, Mail, User, Phone, Shield, Trash2, Ban, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { User as UserType } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const { t } = useTranslation('dashboard')
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
      toast.error(t('messages.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await api.post('/users', formData)
      toast.success(t('messages.success.created'))
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
      toast.error(error.message || t('messages.error.saveFailed'))
    }
  }

  const handleDelete = async (id: number, user: UserType) => {
    if (currentUser?.role === 'admin' && user.role === 'super-admin') {
      toast.error(t('staff.cannotDeleteSuperAdmin'))
      return
    }

    if (!confirm(t('messages.confirm.delete', { item: `${user.firstName} ${user.lastName}` }))) return

    try {
      await api.delete(`/users/${id}`)
      toast.success(t('messages.success.deleted'))
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || t('messages.error.deleteFailed'))
    }
  }

  const handleSuspend = async (id: number, user: UserType) => {
    if (currentUser?.role === 'admin' && user.role === 'super-admin') {
      toast.error(t('staff.cannotSuspendSuperAdmin'))
      return
    }

    const action = user.active ? 'suspend' : 'reactivate'
    if (!confirm(t(`messages.confirm.${action}`, { name: `${user.firstName} ${user.lastName}` }))) return

    try {
      if (user.active) {
        await api.post(`/users/${id}/suspend`, {})
        toast.success(t('messages.success.updated'))
      } else {
        await api.post(`/users/${id}/reactivate`, {})
        toast.success(t('messages.success.updated'))
      }
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || t('messages.error.updateFailed'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const canCreateStaff = currentUser?.role === 'super-admin' || currentUser?.role === 'admin'

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
          <h1 className="text-2xl font-bold text-gray-900">{t('staff.title')}</h1>
          <p className="text-gray-600">{t('staff.subtitle')}</p>
        </div>
        {canCreateStaff && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            {t('staff.addStaff')}
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
                {user.role === 'super-admin' ? t('staff.roles.superAdmin') : 
                 user.role === 'admin' ? t('staff.roles.admin') :
                 user.active ? t('staff.active') : t('staff.suspended')}
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
                <span className="capitalize">
                  {user.role === 'super-admin' ? t('staff.roles.superAdmin') :
                   user.role === 'admin' ? t('staff.roles.admin') :
                   t('staff.roles.staff')}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {t('staff.joined')} {new Date(user.createdAt).toLocaleDateString()}
              </div>
              {canManageUser(user) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSuspend(user.id, user)}
                    className={`p-2 rounded-lg ${
                      user.active 
                        ? 'text-orange-600 hover:bg-orange-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={user.active ? t('staff.suspend') : t('staff.reactivate')}
                  >
                    {user.active ? <Ban size={16} /> : <CheckCircle size={16} />}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(user.id, user)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title={t('common.delete')}
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
          <p className="text-gray-500">{t('staff.noStaff')}</p>
          {canCreateStaff && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('staff.addFirstStaff')}
            </button>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">{t('staff.addStaffMember')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('staff.firstName')}
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
                    {t('staff.lastName')}
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
                  {t('staff.email')} *
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
                  {t('staff.password')} *
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
                  {t('staff.passwordHint')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('staff.phone')}
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
                  {t('staff.role')}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="staff">{t('staff.roles.staff')}</option>
                  <option value="admin">{t('staff.roles.admin')}</option>
                  {currentUser?.role === 'super-admin' && (
                    <option value="super-admin">{t('staff.roles.superAdmin')}</option>
                  )}
                </select>
                {currentUser?.role === 'admin' && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('staff.cannotCreateSuperAdmin')}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  {t('staff.addStaff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}