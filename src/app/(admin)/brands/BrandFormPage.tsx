'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import { toast } from 'react-toastify'
import 'react-quill-new/dist/quill.snow.css'
import {
  createBrand,
  findBrand,
  readCategories,
  updateBrand,
} from './brandStore'
import {
  emptyBrand,
  toFormData,
  toSlug,
} from './brandHelpers'
import type { BrandCategory, BrandFormData } from './brandTypes'
import styles from '../posts/PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  brandId?: string
}

const editorModules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()

const BrandFormPage = ({ mode, brandId }: Props) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<BrandFormData>(emptyBrand)
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadCats = async () => {
      const cats = await readCategories()
      setCategories(cats.filter((category) => category.status === 'active'))
    }
    loadCats()
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !brandId) return

    const loadBrand = async () => {
      const brand = await findBrand(brandId)
      if (!brand) {
        setNotFound(true)
        return
      }

      setForm(toFormData(brand))
    }
    loadBrand()
  }, [mode, brandId])

  const set = <K extends keyof BrandFormData>(key: K, value: BrandFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleNameChange = (name: string) => {
    setForm((previous) => ({
      ...previous,
      name,
      slug: previous.slug ? previous.slug : toSlug(name),
      metaTitle: previous.metaTitle ? previous.metaTitle : name,
    }))
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      set('image', typeof reader.result === 'string' ? reader.result : '')
      event.target.value = ''
    }
    reader.onerror = () => toast.error('Image upload failed')
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    set('image', '')
    set('imageAlt', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  const removeLogo = () => {
    set('logo', '')
    set('logoAlt', '')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const name = form.name.trim()
    const slug = toSlug(form.slug || form.name)
    const description = form.description.trim()

    if (!name) {
      toast.error('Brand name is required')
      return
    }

    if (!slug) {
      toast.error('Brand slug is required')
      return
    }

    const payload: BrandFormData = {
      ...form,
      name,
      slug,
      website: form.website.trim(),
      category: form.category.trim(),
      description,
      imageAlt: form.image ? (form.imageAlt?.trim() || name) : '',
      logoAlt: form.logo ? (form.logoAlt?.trim() || `${name} logo`) : '',
      order: Number(form.order) || 1,
      metaTitle: form.metaTitle?.trim() || name,
      metaDescription: form.metaDescription?.trim() || stripHtml(description).slice(0, 160),
      metaKeywords: form.metaKeywords?.trim() || '',
    }

    if (mode === 'edit' && brandId) {
      await updateBrand(brandId, payload)
      toast.success('Brand updated successfully')
    } else {
      await createBrand(payload)
      toast.success('Brand created successfully')
    }

    router.push('/brands')
  }

  const title = mode === 'create' ? 'Add Brand & Partner' : 'Edit Brand & Partner'

  return (
    <div className={styles.shell}>
      <PageTitle title={title} subTitle="Brands & Partners" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{title}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/brands" className={styles.backBtn}>Cancel</Link>
            <button type="submit" form="brandForm" className={styles.saveBtn}>
              <IconifyIcon icon="tabler:device-floppy" />
              {mode === 'create' ? 'Create Brand' : 'Save Changes'}
            </button>
          </div>
        </div>

        {notFound ? (
          <div className={styles.notFound}>Brand not found.</div>
        ) : (
          <form id="brandForm" className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Name <em>*</em></span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Enter brand or partner name"
                autoFocus
              />
            </label>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Slug <em>*</em></span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => set('slug', toSlug(event.target.value))}
                  placeholder="brand-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as BrandFormData['status'])}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Order</span>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(event) => set('order', Number(event.target.value))}
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.field}>
                <span>Website</span>
                <input
                  type="url"
                  value={form.website}
                  onChange={(event) => set('website', event.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <label className={styles.field}>
                <span>Category</span>
                <select value={form.category} onChange={(event) => set('category', event.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                  {form.category && !categories.some((category) => category.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span>Featured</span>
              <select value={form.featured ? 'yes' : 'no'} onChange={(event) => set('featured', event.target.value === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>

            <div className={styles.field}>
              <span>Image</span>
              <div className={styles.imageUpload}>
                {form.image ? (
                  <div className={styles.imagePreview}>
                    <img src={form.image} alt={form.imageAlt || form.name || 'Brand image'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeImage} aria-label="Remove brand image">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload brand image</strong>
                    <small>PNG, JPG, WEBP, or GIF</small>
                  </button>
                )}
                {form.image && (
                  <button type="button" className={styles.changeImageBtn} onClick={() => fileInputRef.current?.click()}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Image
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className={styles.fileInput} onChange={handleImageChange} />
              </div>
            </div>

            {form.image && (
              <label className={styles.field}>
                <span>Image Alt Text</span>
                <input
                  type="text"
                  value={form.imageAlt}
                  onChange={(event) => set('imageAlt', event.target.value)}
                  placeholder="Describe the image"
                />
              </label>
            )}

            <div className={styles.field}>
              <span>Logo</span>
              <div className={styles.imageUpload}>
                {form.logo ? (
                  <div className={styles.imagePreview}>
                    <img src={form.logo} alt={form.logoAlt || form.name || 'Brand logo'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeLogo} aria-label="Remove brand logo">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => logoInputRef.current?.click()}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload brand logo</strong>
                    <small>PNG, JPG, WEBP, or GIF</small>
                  </button>
                )}
                {form.logo && (
                  <button type="button" className={styles.changeImageBtn} onClick={() => logoInputRef.current?.click()}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Logo
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className={styles.fileInput} onChange={handleLogoChange} />
              </div>
            </div>

            {form.logo && (
              <label className={styles.field}>
                <span>Logo Alt Text</span>
                <input
                  type="text"
                  value={form.logoAlt}
                  onChange={(event) => set('logoAlt', event.target.value)}
                  placeholder="Describe the logo"
                />
              </label>
            )}

            <div className={styles.seoBox}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:seo" />
                <h4>SEO</h4>
              </div>
              <label className={styles.field}>
                <span>Meta Title</span>
                <input value={form.metaTitle} onChange={(event) => set('metaTitle', event.target.value)} placeholder="SEO title" />
              </label>
              <label className={styles.field}>
                <span>Meta Description</span>
                <textarea rows={3} value={form.metaDescription} onChange={(event) => set('metaDescription', event.target.value)} />
              </label>
              <label className={styles.field}>
                <span>Meta Keywords</span>
                <input value={form.metaKeywords} onChange={(event) => set('metaKeywords', event.target.value)} placeholder="keyword one, keyword two" />
              </label>
            </div>

            <label className={styles.field}>
              <span>Description</span>
              <div className={styles.editorWrap}>
                <ReactQuill
                  theme="snow"
                  modules={editorModules}
                  value={form.description}
                  onChange={(value) => set('description', value)}
                  placeholder="Write brand description here"
                />
              </div>
            </label>

            {/* Buttons moved to sticky header */}
          </form>
        )}
      </div>
    </div>
  )
}

export default BrandFormPage
