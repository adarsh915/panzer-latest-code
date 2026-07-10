import { Metadata } from 'next'
import ThemeSettingsPanel from './ThemeSettingsPanel'
import { readSetting } from '@/app/admin/settings/settingsStore'

export const metadata: Metadata = {
  title: 'Theme Settings | Panzer IT Admin',
}

export default async function ThemeSettingsPage() {
  // Read the JSON theme colors from DB, default to empty object
  const themeColors = await readSetting<Record<string, string>>('frontend_theme_colors', {})

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Theme Colors</h1>
      <ThemeSettingsPanel initialColors={themeColors} />
    </div>
  )
}
