// frontend/components/super-admin/components/FeatureCard.tsx
import { ChevronRight } from 'lucide-react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient?: string
  features?: string[]
}

export default function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient = 'from-blue-500/10 to-blue-600/10',
  features = [] 
}: FeatureCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-700">
        <div className="absolute inset-0 rounded-2xl bg-white group-hover:bg-transparent"></div>
      </div>

      <div className="relative p-8 z-10">
        {/* Icon with Animation */}
        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        {features.length > 0 && (
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li 
                key={index}
                className="flex items-center text-gray-700 text-sm group-hover:text-gray-900 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Learn More Link */}
        <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <span>Learn more</span>
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
        </div>

        {/* Glow Effect */}
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
      </div>
    </div>
  )
}