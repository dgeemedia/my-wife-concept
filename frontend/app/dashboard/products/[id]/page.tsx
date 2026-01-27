// ============================================================================
// ADMIN MULTI-IMAGE MANAGER WITH OPTIMIZATION & GUIDANCE
// frontend/app/dashboard/products/[id]/page.tsx
// ============================================================================

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Trash2, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Product, ProductImage } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useCurrency } from '@/components/dashboard/CurrencyProvider'

// Recommended image specifications
const IMAGE_RECOMMENDATIONS = {
  width: 800,
  height: 800,
  maxSize: 2 * 1024 * 1024, // 2MB
  format: ['image/jpeg', 'image/png', 'image/webp'],
  aspectRatio: '1:1'
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showGuidance, setShowGuidance] = useState(true)
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

  // Image optimization function
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.src = e.target?.result as string
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions maintaining aspect ratio
          const maxDimension = IMAGE_RECOMMENDATIONS.width
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'))
                return
              }
              
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              
              resolve(optimizedFile)
            },
            'image/jpeg',
            0.85 // Quality 85%
          )
        }
        
        img.onerror = () => reject(new Error('Failed to load image'))
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  const validateImage = (file: File): { valid: boolean; message?: string } => {
    // Check file type
    if (!IMAGE_RECOMMENDATIONS.format.includes(file.type)) {
      return {
        valid: false,
        message: `Invalid format. Please use JPG, PNG, or WebP`
      }
    }
    
    // Check file size (before optimization)
    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        message: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 5MB`
      }
    }
    
    return { valid: true }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const successfulUploads: string[] = []
    const failedUploads: string[] = []

    try {
      for (const file of Array.from(files)) {
        try {
          // Validate image
          const validation = validateImage(file)
          if (!validation.valid) {
            toast.error(`${file.name}: ${validation.message}`)
            failedUploads.push(file.name)
            continue
          }

          // Optimize image
          const optimizedFile = await optimizeImage(file)
          
          // Show optimization info
          const originalSize = (file.size / 1024).toFixed(0)
          const optimizedSize = (optimizedFile.size / 1024).toFixed(0)
          const savings = ((1 - optimizedFile.size / file.size) * 100).toFixed(0)
          
          console.log(`Optimized ${file.name}: ${originalSize}KB → ${optimizedSize}KB (${savings}% smaller)`)

          // Upload optimized image
          const formData = new FormData()
          formData.append('image', optimizedFile)

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          })

          if (!response.ok) throw new Error('Upload failed')
          const data = await response.json()
          
          successfulUploads.push(data.imageUrl)
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error)
          failedUploads.push(file.name)
        }
      }

      // Add uploaded images to product
      if (successfulUploads.length > 0) {
        const currentImages = product.images || []
        const newImages = successfulUploads.map((url, index) => ({
          id: Date.now() + index,
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

        toast.success(
          `${successfulUploads.length} image(s) uploaded successfully${
            failedUploads.length > 0 ? `, ${failedUploads.length} failed` : ''
          }`
        )
      } else if (failedUploads.length > 0) {
        toast.error(`Failed to upload ${failedUploads.length} image(s)`)
      }
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
          
          {/* IMAGE OPTIMIZATION GUIDANCE */}
          {showGuidance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📸 Image Upload Guidelines for Best Results
                  </h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Recommended Size:</strong> 800x800 pixels (square format)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Max File Size:</strong> 2MB (auto-optimized if larger)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Formats:</strong> JPG, PNG, or WebP
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Aspect Ratio:</strong> 1:1 (square) works best
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <p className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Images will be automatically optimized and compressed for faster loading!</span>
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuidance(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

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
                accept="image/jpeg,image/png,image/webp"
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
                    Optimizing & Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Images (Multiple)
                  </>
                )}
              </button>
              <div className="flex items-start gap-2 mt-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-500">
                  Upload multiple images. First image will be the primary display. 
                  <button 
                    type="button"
                    onClick={() => setShowGuidance(true)}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    View image guidelines
                  </button>
                </p>
              </div>
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
                          loading="lazy"
                        />
                      </div>

                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

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