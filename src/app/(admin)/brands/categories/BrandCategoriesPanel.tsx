'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import {
  createCategory,
  deleteCategory,
  readCategories,
  updateCategory,
} from '../brandStore'
import {
  emptyBrandCategory,
  toCategoryFormData,
  toSlug,
} from '../brandHelpers'
import type {
  BrandCategory,
  BrandCategoryFormData,
} from '../brandTypes'
import styles from '../../posts/categories/BlogCategoriesPanel.module.scss'

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

const BrandCategoriesPanel = () => {
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [form, setForm] = useState<BrandCategoryFormData>(emptyBrandCategory)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadCategories = async () => {
    setCategories(await readCategories())
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return categories.filter((category) =>
      !query ||
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      category.status.toLowerCase().includes(query),
    )
  }, [categories, search])

  const refresh = async () => setCategories(await readCategories())

  const set = <K extends keyof BrandCategoryFormData>(key: K, value: BrandCategoryFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const resetForm = () => {
    setForm(emptyBrandCategory)
    setEditingId(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const name = form.name.trim()
    const slug = toSlug(form.slug || form.name)

    if (!name) {
      toast.error('Category name is required')
      return
    }

    if (!slug) {
      toast.error('Category slug is required')
      return
    }

    const payload = { ...form, name, slug }

    if (editingId) {
      await updateCategory(editingId, payload)
      toast.success('Brand category updated')
    } else {
      await createCategory(payload)
      toast.success('Brand category created')
    }

    resetForm()
    await refresh()
  }

  const editCategory = (category: BrandCategory) => {
    setEditingId(category.id)
    setForm(toCategoryFormData(category))
  }

  const removeCategory = async (category: BrandCategory) => {
    const confirmed = window.confirm(`Delete "${category.name}"? Brands using this category will become uncategorized.`)
    if (!confirmed) return

    await deleteCategory(category.id)
    toast.success('Brand category deleted')
    await refresh()
  }

  return (
    <>
      <PageTitle title="Brand Categories" subTitle="Brands & Partners" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:category" />
            <h3>Brand Categories</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/brands" className={styles.secondaryBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Brands
            </Link>
            <button type="button" className={styles.primaryBtn} onClick={resetForm}>
              <IconifyIcon icon="tabler:plus" />
              New Category
            </button>
          </div>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                const name = event.target.value
                setForm((previous) => ({
                  ...previous,
                  name,
                  slug: previous.slug ? previous.slug : toSlug(name),
                }))
              }}
              placeholder="Category name"
            />
          </label>
          <label className={styles.field}>
            <span>Slug</span>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => set('slug', toSlug(event.target.value))}
              placeholder="category-slug"
            />
          </label>
          <label className={styles.field}>
            <span>Status</span>
            <select value={form.status} onChange={(event) => set('status', event.target.value as BrandCategoryFormData['status'])}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn}>
              <IconifyIcon icon="tabler:device-floppy" />
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className={styles.tableControls}>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchInput}
            placeholder="Search categories"
            aria-label="Search categories"
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td><code className={styles.slugCode}>{category.slug}</code></td>
                    <td>
                      <span className={clsx(styles.badge, category.status === 'active' ? styles.badgeActive : styles.badgeInactive)}>
                        {category.status}
                      </span>
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" className={styles.btnEdit} onClick={() => editCategory(category)} title="Edit category">
                          <IconifyIcon icon="tabler:pencil" />
                        </button>
                        <button type="button" className={styles.btnDelete} onClick={() => removeCategory(category)} title="Delete category">
                          <IconifyIcon icon="tabler:trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>No brand categories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default BrandCategoriesPanel
