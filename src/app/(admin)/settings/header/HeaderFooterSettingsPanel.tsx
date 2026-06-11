'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { type DragEvent, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styles from './HeaderFooterSettingsPanel.module.scss'

// ── Types ────────────────────────────────────────────────────────────────────

type HeaderLogoState = {
  logoUrl: string
  logoAlt: string
  logoWidth: number
}

type SocialLink = {
  id: string
  icon: string
  label: string
  url: string
}

type FooterSettings = {
  // Logo
  showFooterLogo: boolean
  footerLogoUrl: string
  footerLogoAlt: string
  footerLogoWidth: number
  // Contact info
  showEmail: boolean
  email: string
  showPhone: boolean
  phone: string
  showLocation: boolean
  location: string
  // Newsletter
  showNewsletter: boolean
  newsletterLabel: string
  newsletterPlaceholder: string
  // Social icons
  showSocialIcons: boolean
  socialLinks: SocialLink[]
  // Bottom bar
  copyrightText: string
  showYear: boolean
  privacyPolicyLabel: string
  privacyPolicyUrl: string
  showPrivacyPolicy: boolean
  // Appearance
  footerBg: string
  footerTextColor: string
  accentColor: string
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultHeaderLogo: HeaderLogoState = {
  logoUrl: '',
  logoAlt: 'Header Logo',
  logoWidth: 140,
}

const defaultFooter: FooterSettings = {
  showFooterLogo: true,
  footerLogoUrl: '',
  footerLogoAlt: 'Footer Logo',
  footerLogoWidth: 120,
  showEmail: true,
  email: 'Sales@YourCompany.com',
  showPhone: true,
  phone: '+91 90000 00000',
  showLocation: true,
  location: 'Mumbai, Maharashtra',
  showNewsletter: true,
  newsletterLabel: 'Subscribe to our newsletters',
  newsletterPlaceholder: 'Email Address',
  showSocialIcons: true,
  socialLinks: [
    { id: '1', icon: 'tabler:brand-facebook', label: 'Facebook', url: 'https://facebook.com' },
    { id: '2', icon: 'tabler:brand-x', label: 'X (Twitter)', url: 'https://x.com' },
    { id: '3', icon: 'tabler:brand-linkedin', label: 'LinkedIn', url: 'https://linkedin.com' },
    { id: '4', icon: 'tabler:brand-pinterest', label: 'Pinterest', url: 'https://pinterest.com' },
  ],
  copyrightText: 'Copyright © Your Company - Make IT Secure. All Rights Reserved.',
  showYear: false,
  privacyPolicyLabel: 'Privacy Policy',
  privacyPolicyUrl: '/privacy',
  showPrivacyPolicy: true,
  footerBg: '#eaf1fb',
  footerTextColor: '#1e3a5f',
  accentColor: '#2563eb',
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']

// ── Sub-components ────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className={styles.toggle}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={clsx(styles.toggleTrack, checked && styles.toggleOn)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleThumb} />
    </button>
    <span>{label}</span>
  </label>
)

const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className={styles.colorRow}>
    <span>{label}</span>
    <div className={styles.colorInput}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <span>{value.toUpperCase()}</span>
    </div>
  </div>
)

const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
  <div className={styles.sectionTitle}>
    <span className={styles.sectionIcon}>
      <IconifyIcon icon={icon} />
    </span>
    <div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  </div>
)

// ── Reusable Logo Upload Block ────────────────────────────────────────────────

interface LogoUploadSectionProps {
  logoUrl: string
  logoAlt: string
  logoWidth: number
  onUpload: (url: string) => void
  onAltChange: (alt: string) => void
  onWidthChange: (w: number) => void
  onRemove: () => void
}

const LogoUploadSection = ({ logoUrl, logoAlt, logoWidth, onUpload, onAltChange, onWidthChange, onRemove }: LogoUploadSectionProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a valid image (.png, .jpg, .svg, .webp, .gif)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB')
      return
    }
    if (logoUrl.startsWith('blob:')) URL.revokeObjectURL(logoUrl)
    onUpload(URL.createObjectURL(file))
    toast.success('Logo uploaded successfully')
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0])
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    if (logoUrl.startsWith('blob:')) URL.revokeObjectURL(logoUrl)
    onRemove()
    toast.info('Logo removed')
  }

  return (
    <div className={styles.fieldStack}>
      <div
        className={clsx(styles.logoDropZone, isDragOver && styles.logoDropZoneActive)}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload logo"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
          className={styles.hiddenInput}
          onChange={handleInput}
          aria-hidden="true"
        />
        {logoUrl ? (
          <div className={styles.logoPreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={logoAlt} className={styles.logoPreviewImg} style={{ maxWidth: `${logoWidth}px` }} />
            <span className={styles.logoChangeHint}>
              <IconifyIcon icon="tabler:refresh" />
              Click or drag to replace
            </span>
          </div>
        ) : (
          <>
            <span className={styles.logoDropIcon}>
              <IconifyIcon icon={isDragOver ? 'tabler:photo-down' : 'tabler:photo-up'} />
            </span>
            <strong>{isDragOver ? 'Drop to upload' : 'Drag & drop your logo here'}</strong>
            <span>or click to browse &mdash; PNG, JPG, SVG, WebP, GIF &middot; max 2 MB</span>
          </>
        )}
      </div>

      {logoUrl && (
        <>
          <label className={styles.fieldRow}>
            <span>Alt text</span>
            <input
              type="text"
              value={logoAlt}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Describe the logo for accessibility"
            />
          </label>
          <div className={styles.sliderRow}>
            <div className={styles.sliderMeta}>
              <span>Logo width</span>
              <strong>{logoWidth}px</strong>
            </div>
            <input
              type="range"
              min={40}
              max={300}
              value={logoWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              aria-label="Logo width"
            />
          </div>
          <button type="button" className={styles.removeLogoBtn} onClick={handleRemove}>
            <IconifyIcon icon="tabler:trash" />
            Remove logo
          </button>
        </>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const HeaderFooterSettingsPanel = () => {
  const [headerLogo, setHeaderLogo] = useState<HeaderLogoState>(defaultHeaderLogo)
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter)
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header')

  const upd = <K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) =>
    setFooter((prev) => ({ ...prev, [key]: value }))

  const updateSocial = (id: string, field: 'url' | 'label', value: string) =>
    upd('socialLinks', footer.socialLinks.map((s) => (s.id === id ? { ...s, [field]: value } : s)))

  const handleSave = () => toast.success('Header & Footer settings saved successfully')
  const handleReset = () => {
    setHeaderLogo(defaultHeaderLogo)
    setFooter(defaultFooter)
    toast.info('Settings reset to defaults')
  }

  const currentYear = new Date().getFullYear()
  const displayCopyright = footer.showYear
    ? footer.copyrightText.replace('©', `© ${currentYear}`)
    : footer.copyrightText

  return (
    <div className={styles.shell}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2>Header &amp; Footer Settings</h2>
          <p>Manage your admin panel&apos;s header and footer appearance in one place</p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={handleReset}>
            <IconifyIcon icon="tabler:refresh" />
            Reset
          </button>
          <button type="button" className={styles.primaryAction} onClick={handleSave}>
            <IconifyIcon icon="tabler:device-floppy" />
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={clsx(styles.tab, activeTab === 'header' && styles.activeTab)}
          onClick={() => setActiveTab('header')}
        >
          <IconifyIcon icon="tabler:layout-navbar" />
          Header
        </button>
        <button
          type="button"
          className={clsx(styles.tab, activeTab === 'footer' && styles.activeTab)}
          onClick={() => setActiveTab('footer')}
        >
          <IconifyIcon icon="tabler:layout-bottombar" />
          Footer
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.settings}>

          {/* ══════════════════════════════════════════
              HEADER TAB — Logo upload only
          ══════════════════════════════════════════ */}
          {activeTab === 'header' && (
            <section className={styles.panel}>
              <SectionTitle
                icon="tabler:photo-up"
                title="Header Logo"
                subtitle="Upload your brand logo to display in the header"
              />
              <LogoUploadSection
                logoUrl={headerLogo.logoUrl}
                logoAlt={headerLogo.logoAlt}
                logoWidth={headerLogo.logoWidth}
                onUpload={(url) => setHeaderLogo((prev) => ({ ...prev, logoUrl: url }))}
                onAltChange={(alt) => setHeaderLogo((prev) => ({ ...prev, logoAlt: alt }))}
                onWidthChange={(w) => setHeaderLogo((prev) => ({ ...prev, logoWidth: w }))}
                onRemove={() => setHeaderLogo((prev) => ({ ...prev, logoUrl: '' }))}
              />
            </section>
          )}

          {/* ══════════════════════════════════════════
              FOOTER TAB
          ══════════════════════════════════════════ */}
          {activeTab === 'footer' && (
            <>
              {/* 1 ── Footer Logo ── */}
              <section className={styles.panel}>
                <SectionTitle
                  icon="tabler:photo-up"
                  title="Footer Logo"
                  subtitle="Upload your brand logo to display in the footer"
                />
                <div className={styles.fieldStack}>
                  <Toggle
                    checked={footer.showFooterLogo}
                    onChange={(v) => upd('showFooterLogo', v)}
                    label="Show footer logo"
                  />
                </div>
                <LogoUploadSection
                  logoUrl={footer.footerLogoUrl}
                  logoAlt={footer.footerLogoAlt}
                  logoWidth={footer.footerLogoWidth}
                  onUpload={(url) => { upd('footerLogoUrl', url); upd('showFooterLogo', true) }}
                  onAltChange={(alt) => upd('footerLogoAlt', alt)}
                  onWidthChange={(w) => upd('footerLogoWidth', w)}
                  onRemove={() => { upd('footerLogoUrl', ''); upd('showFooterLogo', false) }}
                />
              </section>

              {/* 2 ── Contact Info ── */}
              <section className={styles.panel}>
                <SectionTitle
                  icon="tabler:address-book"
                  title="Contact Info"
                  subtitle="Email, phone, and location shown in the footer middle columns"
                />
                <div className={styles.fieldStack}>
                  {/* Email */}
                  <div className={styles.contactBlock}>
                    <Toggle checked={footer.showEmail} onChange={(v) => upd('showEmail', v)} label="Show email" />
                    {footer.showEmail && (
                      <label className={styles.fieldRow}>
                        <span>
                          <IconifyIcon icon="tabler:mail" />
                          Email address
                        </span>
                        <input
                          type="text"
                          value={footer.email}
                          onChange={(e) => upd('email', e.target.value)}
                          placeholder="Sales@YourCompany.com"
                        />
                      </label>
                    )}
                  </div>

                  {/* Phone */}
                  <div className={styles.contactBlock}>
                    <Toggle checked={footer.showPhone} onChange={(v) => upd('showPhone', v)} label="Show phone number" />
                    {footer.showPhone && (
                      <label className={styles.fieldRow}>
                        <span>
                          <IconifyIcon icon="tabler:phone" />
                          Phone number
                        </span>
                        <input
                          type="text"
                          value={footer.phone}
                          onChange={(e) => upd('phone', e.target.value)}
                          placeholder="+91 90000 00000"
                        />
                      </label>
                    )}
                  </div>

                  {/* Location */}
                  <div className={styles.contactBlock}>
                    <Toggle checked={footer.showLocation} onChange={(v) => upd('showLocation', v)} label="Show location" />
                    {footer.showLocation && (
                      <label className={styles.fieldRow}>
                        <span>
                          <IconifyIcon icon="tabler:map-pin" />
                          Location
                        </span>
                        <input
                          type="text"
                          value={footer.location}
                          onChange={(e) => upd('location', e.target.value)}
                          placeholder="City, State"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </section>

              {/* 3 ── Newsletter Subscribe ── */}
              <section className={styles.panel}>
                <SectionTitle
                  icon="tabler:mail-forward"
                  title="Newsletter Subscribe"
                  subtitle="Email subscription box shown in the top-right of the footer"
                />
                <div className={styles.fieldStack}>
                  <Toggle checked={footer.showNewsletter} onChange={(v) => upd('showNewsletter', v)} label="Show newsletter subscribe" />
                  {footer.showNewsletter && (
                    <>
                      <label className={styles.fieldRow}>
                        <span>Section label</span>
                        <input
                          type="text"
                          value={footer.newsletterLabel}
                          onChange={(e) => upd('newsletterLabel', e.target.value)}
                          placeholder="Subscribe to our newsletters"
                        />
                      </label>
                      <label className={styles.fieldRow}>
                        <span>Input placeholder</span>
                        <input
                          type="text"
                          value={footer.newsletterPlaceholder}
                          onChange={(e) => upd('newsletterPlaceholder', e.target.value)}
                          placeholder="Email Address"
                        />
                      </label>
                      {/* Preview */}
                      <div className={styles.newsletterPreview}>
                        <p>{footer.newsletterLabel}</p>
                        <div className={styles.newsletterInputRow}>
                          <input type="text" placeholder={footer.newsletterPlaceholder} readOnly />
                          <button type="button" style={{ background: footer.accentColor }}>
                            <IconifyIcon icon="tabler:send" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* 4 ── Social Icons ── */}
              <section className={styles.panel}>
                <SectionTitle
                  icon="tabler:share"
                  title="Social Icons"
                  subtitle="Facebook, X, LinkedIn, Pinterest shown below the newsletter"
                />
                <div className={styles.fieldStack}>
                  <Toggle checked={footer.showSocialIcons} onChange={(v) => upd('showSocialIcons', v)} label="Show social icons" />
                  {footer.showSocialIcons && (
                    <div className={styles.linkList}>
                      {footer.socialLinks.map((social) => (
                        <div key={social.id} className={styles.socialRow}>
                          <span className={styles.socialIcon}>
                            <IconifyIcon icon={social.icon} />
                          </span>
                          <span className={styles.socialLabel}>{social.label}</span>
                          <input
                            type="text"
                            value={social.url}
                            onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                            placeholder="https://..."
                            aria-label={`${social.label} URL`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeaderFooterSettingsPanel
