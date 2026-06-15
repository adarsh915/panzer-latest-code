'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import styles from './HomepageSettingsPanel.module.scss'

type BannerSlide = {
  id: string
  eyebrow: string
  title: string
  description: string
  buttonText: string
  buttonUrl: string
  backgroundImage: string
  backgroundAlt: string
}

type BrandPartnerItem = {
  id: string
  name: string
  logo: string
  logoAlt: string
}

type HomepageSettings = {
  slides: BannerSlide[]
  brandPartnersTitle: string
  brandPartners: BrandPartnerItem[]
}

const STORAGE_KEY = 'PANZER_HOMEPAGE_SETTINGS'

const createSlide = (index = 0): BannerSlide => ({
  id: `slide-${Date.now()}-${index}`,
  eyebrow: 'AI Powered Protection',
  title: 'Cyber Resilience For',
  description: 'Anticipate threats, reduce cyber risk and keep your teams moving with clear security, backup and data protection support.',
  buttonText: 'Enquire Today',
  buttonUrl: '/contact',
  backgroundImage: '',
  backgroundAlt: 'Cyber security banner',
})

const createBrandPartner = (index = 0): BrandPartnerItem => ({
  id: `partner-${Date.now()}-${index}`,
  name: 'Brand Partner',
  logo: '',
  logoAlt: 'Brand partner logo',
})

const defaultSettings: HomepageSettings = {
  slides: [
    {
      ...createSlide(1),
      id: 'home-banner-1',
    },
    {
      ...createSlide(2),
      id: 'home-banner-2',
      eyebrow: 'Managed Security',
      title: 'Secure Every Layer',
      description: 'Combine assessment, endpoint protection and data controls for stronger operational resilience.',
    },
    {
      ...createSlide(3),
      id: 'home-banner-3',
      eyebrow: 'Backup Readiness',
      title: 'Recover Without Panic',
      description: 'Keep critical workloads protected with dependable backup, recovery and continuity planning.',
    },
  ],
  brandPartnersTitle: 'Brand Partners',
  brandPartners: [
    { ...createBrandPartner(1), id: 'partner-scopd', name: 'Scopd', logoAlt: 'Scopd logo' },
    { ...createBrandPartner(2), id: 'partner-falcongaze', name: 'Falcongaze', logoAlt: 'Falcongaze logo' },
    { ...createBrandPartner(3), id: 'partner-somansa', name: 'Somansa', logoAlt: 'Somansa logo' },
    { ...createBrandPartner(4), id: 'partner-vembu', name: 'Vembu', logoAlt: 'Vembu logo' },
  ],
}

import { readSetting, writeSetting } from '../../settingsStore'

const readSettings = async (): Promise<HomepageSettings> => {
  const parsed = await readSetting(STORAGE_KEY, defaultSettings)
  return {
    ...defaultSettings,
    ...parsed,
    slides: Array.isArray(parsed?.slides) && parsed.slides.length > 0 ? parsed.slides : defaultSettings.slides,
    brandPartnersTitle: parsed?.brandPartnersTitle || defaultSettings.brandPartnersTitle,
    brandPartners: Array.isArray(parsed?.brandPartners) && parsed.brandPartners.length > 0
      ? parsed.brandPartners
      : defaultSettings.brandPartners,
  }
}

const HomepageSettingsPanel = () => {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const init = async () => setSettings(await readSettings())
    init()
  }, [])

  const activeSlide = useMemo(
    () => settings.slides[Math.min(activeIndex, settings.slides.length - 1)] ?? settings.slides[0],
    [activeIndex, settings.slides],
  )

  const updateSlide = <K extends keyof BannerSlide>(index: number, key: K, value: BannerSlide[K]) => {
    setSettings((previous) => ({
      ...previous,
      slides: previous.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, [key]: value } : slide)),
    }))
  }

  const updateBrandPartner = <K extends keyof BrandPartnerItem>(index: number, key: K, value: BrandPartnerItem[K]) => {
    setSettings((previous) => ({
      ...previous,
      brandPartners: previous.brandPartners.map((partner, partnerIndex) => (
        partnerIndex === index ? { ...partner, [key]: value } : partner
      )),
    }))
  }

  const handleImageChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateSlide(index, 'backgroundImage', typeof reader.result === 'string' ? reader.result : '')
      event.target.value = ''
    }
    reader.onerror = () => toast.error('Banner image upload failed')
    reader.readAsDataURL(file)
  }

  const handlePartnerLogoChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateBrandPartner(index, 'logo', typeof reader.result === 'string' ? reader.result : '')
      event.target.value = ''
    }
    reader.onerror = () => toast.error('Partner logo upload failed')
    reader.readAsDataURL(file)
  }

  const addSlide = () => {
    setSettings((previous) => ({ ...previous, slides: [...previous.slides, createSlide(previous.slides.length)] }))
    setActiveIndex(settings.slides.length)
  }

  const removeSlide = (index: number) => {
    if (settings.slides.length <= 1) {
      toast.error('Homepage banner needs at least one slide')
      return
    }

    setSettings((previous) => ({ ...previous, slides: previous.slides.filter((_, slideIndex) => slideIndex !== index) }))
    setActiveIndex((value) => Math.max(0, Math.min(value, settings.slides.length - 2)))
  }

  const addBrandPartner = () => {
    setSettings((previous) => ({
      ...previous,
      brandPartners: [...previous.brandPartners, createBrandPartner(previous.brandPartners.length)],
    }))
  }

  const removeBrandPartner = (index: number) => {
    setSettings((previous) => ({
      ...previous,
      brandPartners: previous.brandPartners.filter((_, partnerIndex) => partnerIndex !== index),
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await writeSetting(STORAGE_KEY, settings)
    toast.success('Homepage settings saved')
  }

  return (
    <div className={styles.shell}>
      <PageTitle title="Homepage Settings" subTitle="Pages" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:home-cog" />
            <h3>Homepage Banner Slider</h3>
            <span className={styles.totalBadge}>{settings.slides.length}</span>
          </div>
          <button type="button" className={styles.addBtn} onClick={addSlide}>
            <IconifyIcon icon="tabler:plus" />
            Add Slide
          </button>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.sectionTitle}>
            <IconifyIcon icon="tabler:slideshow" />
            <h4>Banner Slides</h4>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Homepage banner slides">
            {settings.slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={clsx(styles.tab, index === activeIndex && styles.tabActive)}
                onClick={() => setActiveIndex(index)}
              >
                Slide {index + 1}
              </button>
            ))}
            <button type="button" className={styles.tabAdd} onClick={addSlide}>
              <IconifyIcon icon="tabler:plus" />
              Add Slide
            </button>
          </div>

          {activeSlide && (
            <div className={styles.slideCard}>
              <div className={styles.slideHeader}>
                <div className={styles.sectionTitle}>
                  <IconifyIcon icon="tabler:photo" />
                  <h4>Slide {activeIndex + 1}</h4>
                </div>
                <button type="button" className={styles.iconBtn} onClick={() => removeSlide(activeIndex)} aria-label="Delete slide">
                  <IconifyIcon icon="tabler:trash" />
                </button>
              </div>

              <div className={styles.gridTwo}>
                <label className={styles.field}>
                  <span>Text 1</span>
                  <input value={activeSlide.eyebrow} onChange={(event) => updateSlide(activeIndex, 'eyebrow', event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Button Text</span>
                  <input value={activeSlide.buttonText} onChange={(event) => updateSlide(activeIndex, 'buttonText', event.target.value)} />
                </label>
              </div>

              <label className={styles.field}>
                <span>Text 2</span>
                <input value={activeSlide.title} onChange={(event) => updateSlide(activeIndex, 'title', event.target.value)} />
              </label>

              <label className={styles.field}>
                <span>Text 3</span>
                <textarea rows={3} value={activeSlide.description} onChange={(event) => updateSlide(activeIndex, 'description', event.target.value)} />
              </label>

              <label className={styles.field}>
                <span>Button Link</span>
                <input value={activeSlide.buttonUrl} onChange={(event) => updateSlide(activeIndex, 'buttonUrl', event.target.value)} />
              </label>

              <div className={styles.upload}>
                {activeSlide.backgroundImage ? (
                  <div className={styles.imagePreview}>
                    <img src={activeSlide.backgroundImage} alt={activeSlide.backgroundAlt || activeSlide.title} />
                    <button
                      type="button"
                      className={clsx(styles.iconBtn, styles.removeImageBtn)}
                      onClick={() => updateSlide(activeIndex, 'backgroundImage', '')}
                      aria-label="Remove banner background"
                    >
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadPlaceholder}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload banner background image</strong>
                    <small>PNG, JPG, WEBP, or GIF</small>
                    <input type="file" accept="image/*" className={styles.fileInput} onChange={(event) => handleImageChange(activeIndex, event)} />
                  </label>
                )}
                {activeSlide.backgroundImage && (
                  <label className={styles.secondaryBtn}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Background
                    <input type="file" accept="image/*" className={styles.fileInput} onChange={(event) => handleImageChange(activeIndex, event)} />
                  </label>
                )}
              </div>

              <label className={styles.field}>
                <span>Background Alt Text</span>
                <input value={activeSlide.backgroundAlt} onChange={(event) => updateSlide(activeIndex, 'backgroundAlt', event.target.value)} />
              </label>
            </div>
          )}

          <div className={styles.sectionTitle}>
            <IconifyIcon icon="tabler:building-store" />
            <h4>Brand Partners Section</h4>
          </div>

          <label className={styles.field}>
            <span>Section Title</span>
            <input
              value={settings.brandPartnersTitle}
              onChange={(event) => setSettings((previous) => ({ ...previous, brandPartnersTitle: event.target.value }))}
            />
          </label>

          <div className={styles.partnerRows}>
            {settings.brandPartners.map((partner, index) => (
              <div key={partner.id} className={styles.partnerRow}>
                <label className={styles.field}>
                  <span>Brand Name</span>
                  <input value={partner.name} onChange={(event) => updateBrandPartner(index, 'name', event.target.value)} />
                </label>

                <div className={styles.partnerLogoCell}>
                  {partner.logo ? (
                    <div className={styles.partnerLogoPreview}>
                      <img src={partner.logo} alt={partner.logoAlt || partner.name} />
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.partnerLogoRemove)}
                        onClick={() => updateBrandPartner(index, 'logo', '')}
                        aria-label="Remove partner logo"
                      >
                        <IconifyIcon icon="tabler:x" />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.partnerUpload}>
                      <IconifyIcon icon="tabler:photo-plus" />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" className={styles.fileInput} onChange={(event) => handlePartnerLogoChange(index, event)} />
                    </label>
                  )}
                </div>

                <label className={styles.field}>
                  <span>Logo Alt Text</span>
                  <input value={partner.logoAlt} onChange={(event) => updateBrandPartner(index, 'logoAlt', event.target.value)} />
                </label>

                <button type="button" className={styles.iconBtn} onClick={() => removeBrandPartner(index)} aria-label="Delete brand partner">
                  <IconifyIcon icon="tabler:trash" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className={styles.secondaryBtn} onClick={addBrandPartner}>
            <IconifyIcon icon="tabler:plus" />
            Add Brand Partner
          </button>

          <button type="submit" className={styles.saveBtn}>
            <IconifyIcon icon="tabler:device-floppy" />
            Save Homepage Settings
          </button>
        </form>

        {activeSlide && (
          <div className={styles.preview}>
            <div
              className={styles.hero}
              style={{
                '--hero-image': activeSlide.backgroundImage
                  ? `url(${activeSlide.backgroundImage})`
                  : 'linear-gradient(120deg, #0d2a4a, #15548a 52%, #0f172a)',
              } as React.CSSProperties}
            >
              <button
                type="button"
                className={clsx(styles.navArrow, styles.navPrev)}
                onClick={() => setActiveIndex((value) => (value === 0 ? settings.slides.length - 1 : value - 1))}
                aria-label="Previous slide"
              >
                <IconifyIcon icon="tabler:chevron-left" />
              </button>
              <div className={styles.heroContent}>
                <span className={styles.eyebrow}>{activeSlide.eyebrow}</span>
                <h2 className={styles.heroTitle}>{activeSlide.title}</h2>
                <p className={styles.heroDescription}>{activeSlide.description}</p>
                <a href={activeSlide.buttonUrl || '#'} className={styles.heroButton}>{activeSlide.buttonText}</a>
              </div>
              <button
                type="button"
                className={clsx(styles.navArrow, styles.navNext)}
                onClick={() => setActiveIndex((value) => (value + 1) % settings.slides.length)}
                aria-label="Next slide"
              >
                <IconifyIcon icon="tabler:chevron-right" />
              </button>
              <div className={styles.dots}>
                {settings.slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={clsx(styles.dot, index === activeIndex && styles.dotActive)}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`View slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.partnerPreviewWrap}>
          <button type="button" className={clsx(styles.partnerArrow, styles.partnerArrowLeft)} aria-label="Previous brand">
            <IconifyIcon icon="tabler:arrow-left" />
          </button>
          <section className={styles.partnerPreview}>
            <h3>{settings.brandPartnersTitle}</h3>
            <div className={styles.partnerGrid}>
              {settings.brandPartners.map((partner) => (
                <div key={partner.id} className={styles.partnerCard}>
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.logoAlt || partner.name} />
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
          <button type="button" className={clsx(styles.partnerArrow, styles.partnerArrowRight)} aria-label="Next brand">
            <IconifyIcon icon="tabler:arrow-right" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomepageSettingsPanel
