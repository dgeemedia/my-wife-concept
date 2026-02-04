// frontend/components/super-admin/components/onboarding/OwnerInfoSection.tsx
interface OwnerInfoSectionProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function OwnerInfoSection({ formData, onChange }: OwnerInfoSectionProps) {
  return (
    <div className="pt-6 border-t">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={onChange}
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={onChange}
              required
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={onChange}
              required
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}