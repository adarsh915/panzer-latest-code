'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import ReactQuill from 'react-quill-new'
import { toast } from 'react-toastify'
import 'react-quill-new/dist/quill.snow.css'
import {
  createSolution,
  emptySolution,
  findSolution,
  solutionCategories,
  toFormData,
  toSlug,
  updateSolution,
  type SolutionFeatureCard,
  type SolutionFormData,
  type SolutionImplementationStep,
} from './solutionStore'
import styles from '../posts/PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  solutionId?: string
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

const createFeatureCard = (): SolutionFeatureCard => ({
  id: `feature-${Date.now()}`,
  icon: 'tabler:shield-check',
  image: '',
  imageAlt: '',
  title: '',
  description: '',
})

const createImplementationStep = (index: number): SolutionImplementationStep => ({
  id: `step-${Date.now()}`,
  step: String(index + 1).padStart(2, '0'),
  title: '',
  description: '',
})

const SolutionFormPage = ({ mode, solutionId }: Props) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<SolutionFormData>(emptySolution)
  const [activeContentTab, setActiveContentTab] = useState<'features' | 'flow'>('features')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (mode !== 'edit' || !solutionId) return

    const solution = findSolution(solutionId)
    if (!solution) {
      setNotFound(true)
      return
    }

    setForm(toFormData(solution))
  }, [mode, solutionId])

  const set = <K extends keyof SolutionFormData>(key: K, value: SolutionFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleTitleChange = (title: string) => {
    setForm((previous) => ({
      ...previous,
      title,
      slug: previous.slug ? previous.slug : toSlug(title),
      metaTitle: previous.metaTitle ? previous.metaTitle : title,
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

  const updateFeatureCard = <K extends keyof SolutionFeatureCard>(index: number, key: K, value: SolutionFeatureCard[K]) => {
    set('featureCards', form.featureCards.map((card, cardIndex) => cardIndex === index ? { ...card, [key]: value } : card))
  }

  const handleFeatureImageChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateFeatureCard(index, 'image', typeof reader.result === 'string' ? reader.result : '')
      event.target.value = ''
    }
    reader.onerror = () => toast.error('Feature card image upload failed')
    reader.readAsDataURL(file)
  }

  const removeFeatureCard = (index: number) => {
    set('featureCards', form.featureCards.filter((_, cardIndex) => cardIndex !== index))
  }

  const removeImplementationStep = (index: number) => {
    set('implementationSteps', form.implementationSteps.filter((_, stepIndex) => stepIndex !== index))
  }

  const updateImplementationStep = <K extends keyof SolutionImplementationStep>(
    index: number,
    key: K,
    value: SolutionImplementationStep[K],
  ) => {
    set('implementationSteps', form.implementationSteps.map((step, stepIndex) => stepIndex === index ? { ...step, [key]: value } : step))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    const title = form.title.trim()
    const slug = toSlug(form.slug || form.title)
    const description = form.description.trim()

    if (!title) {
      toast.error('Solution title is required')
      return
    }

    if (!slug) {
      toast.error('Solution slug is required')
      return
    }

    if (!stripHtml(description)) {
      toast.error('Description is required')
      return
    }

    const payload: SolutionFormData = {
      ...form,
      title,
      slug,
      subtitle: form.subtitle.trim(),
      category: form.category.trim(),
      description,
      imageAlt: form.image ? (form.imageAlt?.trim() || title) : '',
      order: Number(form.order) || 1,
      featureCards: form.featureCards
        .map((card) => ({
          ...card,
          icon: card.icon.trim() || 'tabler:shield-check',
          image: card.image ?? '',
          imageAlt: card.image ? (card.imageAlt?.trim() || card.title.trim()) : '',
          title: card.title.trim(),
          description: card.description.trim(),
        }))
        .filter((card) => card.title || card.description || card.image),
      implementationSteps: form.implementationSteps
        .map((step, index) => ({
          ...step,
          step: step.step.trim() || String(index + 1).padStart(2, '0'),
          title: step.title.trim(),
          description: step.description.trim(),
        }))
        .filter((step) => step.title || step.description),
      metaTitle: form.metaTitle?.trim() || title,
      metaDescription: form.metaDescription?.trim() || stripHtml(description).slice(0, 160),
      metaKeywords: form.metaKeywords?.trim() || '',
    }

    if (mode === 'edit' && solutionId) {
      updateSolution(solutionId, payload)
      toast.success('Solution updated successfully')
    } else {
      createSolution(payload)
      toast.success('Solution created successfully')
    }

    router.push('/solutions')
  }

  const title = mode === 'create' ? 'Add Solution & Service' : 'Edit Solution & Service'

  return (
    <div className={styles.shell}>
      <PageTitle title={title} subTitle="Solutions & Services" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{title}</h3>
          </div>
          <Link href="/solutions" className={styles.backBtn}>
            <IconifyIcon icon="tabler:arrow-left" />
            Back to Solutions
          </Link>
        </div>

        {notFound ? (
          <div className={styles.notFound}>Solution not found.</div>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Title <em>*</em></span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter solution title"
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
                  placeholder="solution-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as SolutionFormData['status'])}>
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
                <span>Subtitle</span>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(event) => set('subtitle', event.target.value)}
                  placeholder="e.g. Data Leak Prevention"
                />
              </label>
              <label className={styles.field}>
                <span>Category</span>
                <select value={form.category} onChange={(event) => set('category', event.target.value)}>
                  {solutionCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>

            <div className={styles.field}>
              <span>Solution Image</span>
              <div className={styles.imageUpload}>
                {form.image ? (
                  <div className={styles.imagePreview}>
                    <img src={form.image} alt={form.imageAlt || form.title || 'Solution image'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeImage} aria-label="Remove solution image">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload solution image</strong>
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
                  placeholder="Describe the solution image"
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

            <div className={styles.tabBox}>
              <div className={styles.tabHeader} role="tablist" aria-label="Solution content sections">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeContentTab === 'features'}
                  className={activeContentTab === 'features' ? styles.tabActive : undefined}
                  onClick={() => setActiveContentTab('features')}
                >
                  <IconifyIcon icon="tabler:layout-grid-add" />
                  Feature Cards
                  <span>{form.featureCards.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeContentTab === 'flow'}
                  className={activeContentTab === 'flow' ? styles.tabActive : undefined}
                  onClick={() => setActiveContentTab('flow')}
                >
                  <IconifyIcon icon="tabler:git-branch" />
                  Implementation Flow
                  <span>{form.implementationSteps.length}</span>
                </button>
              </div>

              <div className={styles.tabPanel}>
                {activeContentTab === 'features' ? (
                  <>
                    <div className={styles.sectionTitle}>
                      <IconifyIcon icon="tabler:layout-grid-add" />
                      <h4>Feature Cards</h4>
                    </div>
                    {form.featureCards.map((card, index) => (
                      <div key={card.id} className={styles.repeaterCard}>
                        <div className={styles.repeaterCardHeader}>
                          <div className={styles.repeaterTitle}>
                            <span className={styles.repeaterIconPreview}>
                              {card.image ? <img src={card.image} alt={card.imageAlt || card.title || 'Feature card'} /> : <IconifyIcon icon={card.icon || 'tabler:shield-check'} />}
                            </span>
                            <strong>{card.title || `Feature Card ${index + 1}`}</strong>
                          </div>
                          <button type="button" className={styles.iconDangerBtn} onClick={() => removeFeatureCard(index)} aria-label="Delete feature card" title="Delete card">
                            <IconifyIcon icon="tabler:trash" />
                          </button>
                        </div>

                        <div className={styles.repeaterBody}>
                          <div className={styles.miniUpload}>
                            {card.image ? (
                              <div className={styles.miniImagePreview}>
                                <img src={card.image} alt={card.imageAlt || card.title || 'Feature card'} />
                                <button
                                  type="button"
                                  className={styles.removeImageBtn}
                                  onClick={() => {
                                    updateFeatureCard(index, 'image', '')
                                    updateFeatureCard(index, 'imageAlt', '')
                                  }}
                                  aria-label="Remove feature card image"
                                  title="Remove image"
                                >
                                  <IconifyIcon icon="tabler:x" />
                                </button>
                              </div>
                            ) : (
                              <label className={styles.miniUploadPlaceholder}>
                                <IconifyIcon icon="tabler:photo-plus" />
                                <span>Upload image</span>
                                <input type="file" accept="image/*" className={styles.fileInput} onChange={(event) => handleFeatureImageChange(index, event)} />
                              </label>
                            )}
                            {card.image && (
                              <label className={styles.changeImageBtn}>
                                <IconifyIcon icon="tabler:upload" />
                                Change Image
                                <input type="file" accept="image/*" className={styles.fileInput} onChange={(event) => handleFeatureImageChange(index, event)} />
                              </label>
                            )}
                          </div>

                          <div className={styles.repeaterFields}>
                            <div className={styles.gridTwo}>
                              <label className={styles.field}>
                                <span>Icon</span>
                                <input value={card.icon} onChange={(event) => updateFeatureCard(index, 'icon', event.target.value)} placeholder="tabler:shield" />
                              </label>
                              <label className={styles.field}>
                                <span>Title</span>
                                <input value={card.title} onChange={(event) => updateFeatureCard(index, 'title', event.target.value)} />
                              </label>
                            </div>
                            {card.image && (
                              <label className={styles.field}>
                                <span>Image Alt Text</span>
                                <input value={card.imageAlt ?? ''} onChange={(event) => updateFeatureCard(index, 'imageAlt', event.target.value)} />
                              </label>
                            )}
                            <label className={styles.field}>
                              <span>Description</span>
                              <textarea rows={3} value={card.description} onChange={(event) => updateFeatureCard(index, 'description', event.target.value)} />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className={styles.changeImageBtn} onClick={() => set('featureCards', [...form.featureCards, createFeatureCard()])}>
                      <IconifyIcon icon="tabler:plus" />
                      Add Card
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.sectionTitle}>
                      <IconifyIcon icon="tabler:git-branch" />
                      <h4>Implementation Flow</h4>
                    </div>
                    {form.implementationSteps.map((step, index) => (
                      <div key={step.id} className={styles.flowCard}>
                        <div className={styles.flowStepBadge}>{step.step || String(index + 1).padStart(2, '0')}</div>
                        <div className={styles.flowFields}>
                          <div className={styles.grid}>
                            <label className={styles.field}>
                              <span>Step</span>
                              <input value={step.step} onChange={(event) => updateImplementationStep(index, 'step', event.target.value)} />
                            </label>
                            <label className={styles.field}>
                              <span>Title</span>
                              <input value={step.title} onChange={(event) => updateImplementationStep(index, 'title', event.target.value)} />
                            </label>
                            <label className={styles.field}>
                              <span>Description</span>
                              <input value={step.description} onChange={(event) => updateImplementationStep(index, 'description', event.target.value)} />
                            </label>
                          </div>
                        </div>
                        <button type="button" className={styles.iconDangerBtn} onClick={() => removeImplementationStep(index)} aria-label="Delete implementation step" title="Delete step">
                          <IconifyIcon icon="tabler:trash" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.changeImageBtn}
                      onClick={() => set('implementationSteps', [...form.implementationSteps, createImplementationStep(form.implementationSteps.length)])}
                    >
                      <IconifyIcon icon="tabler:plus" />
                      Add Step
                    </button>
                  </>
                )}
              </div>
            </div>

            <label className={styles.field}>
              <span>Description <em>*</em></span>
              <div className={styles.editorWrap}>
                <ReactQuill
                  theme="snow"
                  modules={editorModules}
                  value={form.description}
                  onChange={(value) => set('description', value)}
                  placeholder="Write solution description here"
                />
              </div>
            </label>

            <div className={styles.actions}>
              <Link href="/solutions" className={styles.backBtn}>Cancel</Link>
              <button type="submit" className={styles.saveBtn}>
                <IconifyIcon icon="tabler:device-floppy" />
                {mode === 'create' ? 'Create Solution' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SolutionFormPage
