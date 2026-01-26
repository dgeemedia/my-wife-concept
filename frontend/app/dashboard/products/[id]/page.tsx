// ============================================================================
// ADMIN MULTI-IMAGE MANAGER
// frontend/app/dashboard/products/[id]/page.tsx (UPDATED VERSION)
// ============================================================================

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Trash2, GripVertical } from 'lucide-react'
import { Product, ProductImage } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useCurrency } from '@/components/dashboard/CurrencyProvider'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [product, setProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: '',
    images: [],
    createdAt: '',
    updatedAt: ''
  })

  const { symbol } = useCurrency()

  useEffect(() => {
    if (productId && productId !== 'new') {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/products/${productId}`)
      setProduct(data)
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/dashboard/products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      // Upload all files
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        if (!response.ok) throw new Error('Upload failed')
        const data = await response.json()
        return data.imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      // Add uploaded images to product
      const currentImages = product.images || []
      const newImages = uploadedUrls.map((url, index) => ({
        id: Date.now() + index, // Temporary ID
        productId: product.id,
        imageUrl: url,
        order: currentImages.length + index,
        isPrimary: currentImages.length === 0 && index === 0,
        createdAt: new Date().toISOString()
      }))

      setProduct(prev => ({
        ...prev,
        images: [...currentImages, ...newImages]
      }))

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (imageIndex: number) => {
    const updatedImages = (product.images || []).filter((_, index) => index !== imageIndex)
    setProduct(prev => ({ ...prev, images: updatedImages }))
    toast.success('Image removed')
  }

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const images = [...(product.images || [])]
    const [movedImage] = images.splice(fromIndex, 1)
    images.splice(toIndex, 0, movedImage)
    
    // Update order values
    const reorderedImages = images.map((img, index) => ({
      ...img,
      order: index
    }))
    
    setProduct(prev => ({ ...prev, images: reorderedImages }))
  }

  const handleSetPrimaryImage = (imageIndex: number) => {
    const updatedImages = (product.images || []).map((img, index) => ({
      ...img,
      isPrimary: index === imageIndex
    }))
    setProduct(prev => ({ ...prev, images: updatedImages }))
    toast.success('Primary image updated')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        ...product,
        images: (product.images || []).map(img => ({
          imageUrl: img.imageUrl,
          order: img.order,
          isPrimary: img.isPrimary
        }))
      }

      if (productId === 'new') {
        await api.post('/products', productData)
        toast.success('Product created successfully')
      } else {
        await api.put(`/products/${productId}`, productData)
        toast.success('Product updated successfully')
      }
      router.push('/dashboard/products')
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }))
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/products"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {productId === 'new' ? 'Add New Product' : 'Edit Product'}
            </h1>
            <p className="text-gray-600">
              {productId === 'new' ? 'Create a new product' : 'Update product details'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* MULTI-IMAGE GALLERY MANAGER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Images
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Images (Multiple)
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Click to upload multiple images. First image will be the primary display.
              </p>
            </div>

            {/* Image Gallery Grid */}
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {product.images
                  .sort((a, b) => a.order - b.order)
                  .map((image, index) => (
                    <div
                      key={image.id || index}
                      className="relative group bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
                    >
                      {/* Image */}
                      <div className="aspect-square relative">
                        <img
                          src={image.imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Reorder Buttons */}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleReorderImages(index, index - 1)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        
                        {index < (product.images?.length || 0) - 1 && (
                          <button
                            type="button"
                            onClick={() => handleReorderImages(index, index + 1)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                      </div>

                      {/* Primary Badge */}
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Primary
                        </div>
                      )}

                      {/* Order Badge */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        #{index + 1}
                      </div>

                      {/* Set as Primary Button */}
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(index)}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-all"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No images uploaded</p>
                  <p className="text-sm text-gray-500">
                    Click the upload button above to add product images
                  </p>
                </div>
              </div>
            )}

            {/* Legacy Image URL Input (Optional) */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Or enter a single image URL:</p>
              <input
                type="url"
                name="imageUrl"
                value={product.imageUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ({symbol}) *
              </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={product.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your product..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href="/dashboard/products"
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}