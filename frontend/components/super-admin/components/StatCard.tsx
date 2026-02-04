// frontend/components/super-admin/components/StatCard.tsx
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  bgColor: string
}

export default function StatCard({ icon, label, value, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}