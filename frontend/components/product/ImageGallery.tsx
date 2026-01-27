// ============================================================================
// OPTIMIZED IMAGE GALLERY COMPONENT
// frontend/components/product/ImageGallery.tsx
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: Array<{ id: number; imageUrl: string; order: number }>
  productName: string
  autoRotate?: boolean
  rotateInterval?: number // in milliseconds
}

export default function ImageGallery({ 
  images, 
  productName, 
  autoRotate = true,
  rotateInterval = 3000 
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([])
  const [imageError, setImageError] = useState<boolean[]>([])

  // Initialize loading states
  useEffect(() => {
    setImageLoaded(new Array(images.length).fill(false))
    setImageError(new Array(images.length).fill(false))
  }, [images])

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || isPaused || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, rotateInterval)

    return () => clearInterval(interval)
  }, [autoRotate, isPaused, images.length, rotateInterval])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  const handleImageError = (index: number) => {
    setImageError(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-2">📦</div>
          <p className="text-sm">No image</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Image */}
      <div className="relative w-full h-full">
        {imageError[currentIndex] ? (
          // Error state - show fallback
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2">📦</div>
              <p className="text-xs">Image unavailable</p>
            </div>
          </div>
        ) : (
          <>
            {/* Loading skeleton */}
            {!imageLoaded[currentIndex] && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse" />
            )}
            
            {/* Actual image */}
            <Image
              src={images[currentIndex].imageUrl}
              alt={`${productName} - Image ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-500 ${
                imageLoaded[currentIndex] ? 'opacity-100' : 'opacity-0'
              }`}
              priority={currentIndex === 0}
              quality={85}
              onLoad={() => handleImageLoad(currentIndex)}
              onError={() => handleImageError(currentIndex)}
            />
          </>
        )}
      </div>

      {/* Navigation Arrows - Show on hover if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Pause Indicator */}
          {isPaused && autoRotate && (
            <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              Paused
            </div>
          )}
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}