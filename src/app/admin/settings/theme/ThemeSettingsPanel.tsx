'use client'

import { useState } from 'react'
import { writeSetting } from '@/app/admin/settings/settingsStore'
import { useRouter } from 'next/navigation'
import styles from './ThemeSettingsPanel.module.scss'

interface ThemeSettingsPanelProps {
  initialColors: Record<string, string>
}

const defaultColors = {
  '--theme-color': '#1053f3',
  '--theme-navy-dark': '#061153',
  '--theme-blue-light': '#79c6ff',
  '--theme-navy-darker': '#061238',
  '--theme-blue-medium': '#2f63dd',
  '--theme-navy-medium': '#123b88',
  '--theme-blue-bright': '#2b72ff',
  '--theme-navy-slate': '#273553',
  '--theme-navy-deep': '#07133d',
  '--theme-navy-slate-light': '#34405e',
  '--theme-blue-dark': '#051372',
  '--dark-color3': '#000000',
  '--bs-bg-color2': '#f3f6fe',
  '--bs-bg-color23': '#eef4ff',
  '--bs-bg-color24': '#fbfdff',
  '--bs-bg-color25': '#f6f9ff',
  '--light-color': '#f4f7ff',
  '--light-color2': '#e8edfa',
  '--white-color': '#ffffff',
  '--cardmention': '#ffffff',
}

const colorLabels: Record<string, string> = {
  '--theme-color': 'Primary Blue',
  '--theme-navy-dark': 'Navy Dark',
  '--theme-blue-light': 'Blue Light',
  '--theme-navy-darker': 'Navy Darker',
  '--theme-blue-medium': 'Blue Medium',
  '--theme-navy-medium': 'Navy Medium',
  '--theme-blue-bright': 'Blue Bright',
  '--theme-navy-slate': 'Navy Slate',
  '--theme-navy-deep': 'Navy Deep',
  '--theme-navy-slate-light': 'Navy Slate Light',
  '--theme-blue-dark': 'Blue Dark',
  '--dark-color3': 'Dark Color (Black)',
  '--bs-bg-color2': 'Background Color 2',
  '--bs-bg-color23': 'Background Color 23',
  '--bs-bg-color24': 'Background Color 24',
  '--bs-bg-color25': 'Background Color 25',
  '--light-color': 'Light Color 1',
  '--light-color2': 'Light Color 2',
  '--white-color': 'White Color',
  '--cardmention': 'Card Mention Background',
}

export default function ThemeSettingsPanel({ initialColors }: ThemeSettingsPanelProps) {
  const router = useRouter()
  const [colors, setColors] = useState<Record<string, string>>({
    ...defaultColors,
    ...initialColors, // Override defaults with saved colors if any exist
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save the entire object as JSON in the database
      await writeSetting('frontend_theme_colors', colors)
      alert('Theme colors saved successfully!')
      router.refresh() // Refresh to reflect in layout
    } catch (error) {
      console.error(error)
      alert('Failed to save theme colors.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all colors to their defaults?')) return

    setIsSaving(true)
    try {
      // Save an empty object or the explicit defaults. Saving defaults guarantees it resets on the frontend.
      await writeSetting('frontend_theme_colors', defaultColors)
      setColors(defaultColors)
      alert('Theme colors reset to defaults.')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to reset theme colors.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <h3>Dynamic Theme Colors</h3>
            <p>Customize the primary and secondary colors used across the frontend website.</p>
          </div>
          <div className={styles.actions}>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className={styles.resetBtn}
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={styles.saveBtn}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {Object.keys(defaultColors).map((key) => (
            <div key={key} className={styles.colorItem}>
              <label className={styles.colorLabel}>
                <span>{colorLabels[key] || key}</span>
                <span className={styles.hex}>{colors[key]}</span>
              </label>
              <div className={styles.colorInputRow}>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className={styles.colorPicker}
                />
                <input 
                  type="text" 
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className={styles.textInput}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
