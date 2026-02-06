// frontend/app/platform/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function PlatformLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.ok && data.token) {
        // Check if user is super-admin
        if (data.user.role !== 'super-admin') {
          setError('Access denied. Authorized staff credentials required.')
          return
        }

        toast.success('Welcome to Platform Dashboard')
        router.push('/platform/dashboard')
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      <div className="max-w-md w-full p-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-xl mb-4">
            <Image 
              src="/logo.svg" 
              alt="MyPadiFood Logo" 
              width={48} 
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Platform Login</h1>
          <p className="text-blue-100">Authorized Personnel Only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="admin@mypadifood.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In to Platform'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Main Site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}