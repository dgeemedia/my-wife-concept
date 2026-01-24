// frontend/app/dashboard/settings/components/SocialMediaSection.tsx
import { Globe } from 'lucide-react'

interface SocialMediaSectionProps {
  settings: any
  handleChange: (e: any) => void
}

export default function SocialMediaSection({
  settings,
  handleChange
}: SocialMediaSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center mb-6">
        <Globe className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Social Media Links</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook URL
          </label>
          <input
            type="url"
            name="facebookUrl"
            value={settings.facebookUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://facebook.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram URL
          </label>
          <input
            type="url"
            name="instagramUrl"
            value={settings.instagramUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://instagram.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            X (Twitter) URL
          </label>
          <input
            type="url"
            name="twitterUrl"
            value={settings.twitterUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://x.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={settings.linkedinUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://linkedin.com/company/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TikTok URL
          </label>
          <input
            type="url"
            name="tiktokUrl"
            value={settings.tiktokUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://tiktok.com/@yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            name="youtubeUrl"
            value={settings.youtubeUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://youtube.com/@yourpage"
          />
        </div>
      </div>
    </div>
  )
}