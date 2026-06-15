'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import styles from './FooterSettingsPanel.module.scss'

type SocialLink = {
  id: 'linkedin' | 'x' | 'google'
  label: string
  icon: string
  url: string
}

type FooterSettings = {
  logo: string
  logoAlt: string
  email: string
  phone: string
  location: string
  socialLinks: SocialLink[]
}

const STORAGE_KEY = 'PANZER_FOOTER_SETTINGS'

const defaultSettings: FooterSettings = {
  logo: '',
  logoAlt: 'Panzer IT',
  email: 'Sales@PanzerIT.com',
  phone: '+91 90046 55099',
  location: 'Delhi (NCR) | Mumbai | All India Network',
  socialLinks: [
    { id: 'linkedin', label: 'LinkedIn', icon: 'tabler:brand-linkedin', url: 'https://linkedin.com' },
    { id: 'x', label: 'X', icon: 'tabler:brand-x', url: 'https://x.com' },
    { id: 'google', label: 'Google', icon: 'tabler:brand-google', url: 'https://google.com' },
  ],
}

import { readSetting, writeSetting } from '../settingsStore'

const readSettings = async (): Promise<FooterSettings> => {
  const parsed = await readSetting(STORAGE_KEY, defaultSettings)
  return {
    ...defaultSettings,
    ...parsed,
    socialLinks: Array.isArray(parsed?.socialLinks) ? parsed.socialLinks : defaultSettings.socialLinks
  }
}

const FooterSettingsPanel = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings)

  useEffect(() => {
    const init = async () => setSettings(await readSettings())
    init()
  }, [])

  const set = <K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) => {
    setSettings((previous) => ({ ...previous, [key]: value }))
  }

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      set('logo', typeof reader.result === 'string' ? reader.result : '')
      event.target.value = ''
    }
    reader.onerror = () => toast.error('Logo upload failed')
    reader.readAsDataURL(file)
  }

  const updateSocial = (id: SocialLink['id'], url: string) => {
    set('socialLinks', settings.socialLinks.map((link) => (link.id === id ? { ...link, url } : link)))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await writeSetting(STORAGE_KEY, settings)
    toast.success('Footer settings saved')
  }

  return (
    <div className={styles.shell}>
      <PageTitle title="Footer Settings" subTitle="Setting" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:layout-bottombar" />
            <h3>Footer Content</h3>
          </div>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.sectionTitle}>
            <IconifyIcon icon="tabler:photo" />
            <h4>Logo</h4>
          </div>

          <div className={styles.upload}>
            {settings.logo ? (
              <div className={styles.logoPreview}>
                <img src={settings.logo} alt={settings.logoAlt} />
                <button type="button" className={styles.iconBtn} onClick={() => set('logo', '')} aria-label="Remove footer logo">
                  <IconifyIcon icon="tabler:x" />
                </button>
              </div>
            ) : (
              <button type="button" className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
                <IconifyIcon icon="tabler:photo-plus" />
                <strong>Upload footer logo</strong>
                <small>PNG, JPG, WEBP, SVG, or GIF</small>
              </button>
            )}
            {settings.logo && (
              <button type="button" className={styles.secondaryBtn} onClick={() => fileInputRef.current?.click()}>
                <IconifyIcon icon="tabler:upload" />
                Change Logo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className={styles.fileInput} onChange={handleLogoChange} />
          </div>

          <label className={styles.field}>
            <span>Logo Alt Text</span>
            <input value={settings.logoAlt} onChange={(event) => set('logoAlt', event.target.value)} />
          </label>

          <div className={styles.sectionTitle}>
            <IconifyIcon icon="tabler:address-book" />
            <h4>Contact Details</h4>
          </div>

          <div className={styles.gridTwo}>
            <label className={styles.field}>
              <span>Email</span>
              <input type="email" value={settings.email} onChange={(event) => set('email', event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Call Us</span>
              <input value={settings.phone} onChange={(event) => set('phone', event.target.value)} />
            </label>
          </div>

          <label className={styles.field}>
            <span>Location</span>
            <input value={settings.location} onChange={(event) => set('location', event.target.value)} />
          </label>

          <div className={styles.sectionTitle}>
            <IconifyIcon icon="tabler:share" />
            <h4>Social Icons</h4>
          </div>

          <div className={styles.socialRows}>
            {settings.socialLinks.map((link) => (
              <div key={link.id} className={styles.socialRow}>
                <label className={styles.field}>
                  <span>{link.label}</span>
                  <input value={link.label} disabled />
                </label>
                <label className={styles.field}>
                  <span>URL</span>
                  <input value={link.url} onChange={(event) => updateSocial(link.id, event.target.value)} />
                </label>
              </div>
            ))}
          </div>

          <button type="submit" className={styles.saveBtn}>
            <IconifyIcon icon="tabler:device-floppy" />
            Save Footer Settings
          </button>
        </form>

        <div className={styles.preview}>
          <div className={styles.previewTop}>
            <div>
              {settings.logo ? (
                <img src={settings.logo} alt={settings.logoAlt} className={styles.previewLogo} />
              ) : (
                <span className={styles.logoFallback}>Panzer IT</span>
              )}
            </div>
          </div>

          <div className={styles.previewDivider} />

          <div className={styles.previewBottom}>
            <div className={styles.previewBlock}>
              <strong>Email</strong>
              <span><IconifyIcon icon="tabler:mail" /> {settings.email}</span>
            </div>
            <div className={styles.previewBlock}>
              <strong>Call Us :</strong>
              <span><IconifyIcon icon="tabler:phone-call" /> {settings.phone}</span>
            </div>
            <div className={styles.previewBlock}>
              <strong>Location</strong>
              <span><IconifyIcon icon="tabler:map-pin-filled" /> {settings.location}</span>
            </div>
            <div className={styles.previewBlock}>
              <strong>Social Links</strong>
              <div className={styles.socialIcons}>
                {settings.socialLinks.map((link) => (
                  <a key={link.id} href={link.url || '#'} aria-label={link.label}>
                    <IconifyIcon icon={link.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FooterSettingsPanel
