// frontend/components/dashboard/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary-600' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const colorClasses = {
    'primary-600': 'border-primary-600',
    'white': 'border-white',
    'gray-400': 'border-gray-400'
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 ${colorClasses[color as keyof typeof colorClasses] || 'border-primary-600'} border-t-transparent`}
      />
    </div>
  )
}