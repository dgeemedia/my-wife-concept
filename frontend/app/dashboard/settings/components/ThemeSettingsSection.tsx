// frontend/app/dashboard/settings/components/ThemeSettingsSection.tsx
import { Palette } from 'lucide-react'

interface ThemeSettingsSectionProps {
  settings: any
  handleChange: (e: any) => void
  applyColorPreset: (preset: any) => void
  colorPresets: any[]
}

export default function ThemeSettingsSection({
  settings,
  handleChange,
  applyColorPreset,
  colorPresets
}: ThemeSettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center mb-6">
        <Palette className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-lg font-semibold">Theme Settings</h2>
      </div>
      
      {/* Color Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Color Themes
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {colorPresets.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyColorPreset(preset)}
              className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex gap-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              name="primaryColor"
              value={settings.primaryColor}
              onChange={handleChange}
              className="w-12 h-12 cursor-pointer rounded"
            />
            <input
              type="text"
              name="primaryColor"
              value={settings.primaryColor}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Used for buttons, links, and highlights
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              name="secondaryColor"
              value={settings.secondaryColor}
              onChange={handleChange}
              className="w-12 h-12 cursor-pointer rounded"
            />
            <input
              type="text"
              name="secondaryColor"
              value={settings.secondaryColor}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Used for accents and secondary elements
          </p>
        </div>
      </div>
    </div>
  )
}