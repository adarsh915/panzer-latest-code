'use server'

import pool from '@/lib/db'
import { toSlug } from './blogHelpers'
import type {
  BlogCategory,
  BlogCategoryFormData,
  BlogPost,
  BlogPostFormData,
  PostStatus,
} from './blogTypes'

// Re-export types so components only need to import from blogStore
export type {
  BlogCategory,
  BlogCategoryFormData,
  BlogPost,
  BlogPostFormData,
  PostStatus,
}


export const readPosts = async (): Promise<BlogPost[]> => {
  const [rows] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    author: row.author ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageAlt: row.image_alt ?? '',
    categoryId: row.category_id ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
  }))
}

export const createPost = async (data: BlogPostFormData): Promise<BlogPost> => {
  const id = `p${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.title)
  const publishedAt = data.status === 'published'
    ? (data.publishedAt || new Date().toISOString()).slice(0, 19).replace('T', ' ')
    : null

  await pool.query(
    `INSERT INTO blog_posts (id, title, slug, status, author, description, image, image_alt, category_id, tags, meta_title, meta_description, meta_keywords, published_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title || '',
      slug,
      data.status || 'draft',
      data.author || '',
      data.description || '',
      data.image || '',
      data.imageAlt || '',
      data.categoryId || '',
      JSON.stringify(data.tags || []),
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      publishedAt,
      createdAt,
    ]
  )

  return {
    ...data,
    id,
    slug,
    createdAt,
    publishedAt: publishedAt ?? '',
  }
}

export const updatePost = async (id: string, data: BlogPostFormData): Promise<BlogPost | undefined> => {
  const slug = toSlug(data.slug || data.title)
  const publishedAt = data.status === 'published'
    ? (data.publishedAt || new Date().toISOString()).slice(0, 19).replace('T', ' ')
    : null

  await pool.query(
    `UPDATE blog_posts SET title = ?, slug = ?, status = ?, author = ?, description = ?, image = ?, image_alt = ?, category_id = ?, tags = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, published_at = ? WHERE id = ?`,
    [
      data.title || '',
      slug,
      data.status || 'draft',
      data.author || '',
      data.description || '',
      data.image || '',
      data.imageAlt || '',
      data.categoryId || '',
      JSON.stringify(data.tags || []),
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      publishedAt,
      id,
    ]
  )

  return { ...data, id, slug, createdAt: new Date().toISOString(), publishedAt: publishedAt ?? '' }
}

export const deletePost = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM blog_posts WHERE id = ?', [id])
}

export const findPost = async (id: string): Promise<BlogPost | undefined> => {
  const posts = await readPosts()
  return posts.find((post) => post.id === id)
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const readCategories = async (): Promise<BlogCategory[]> => {
  const [rows] = await pool.query('SELECT * FROM blog_categories ORDER BY created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const createCategory = async (data: BlogCategoryFormData): Promise<BlogCategory> => {
  const id = `bc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.name)

  await pool.query(
    'INSERT INTO blog_categories (id, name, slug, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name || '', slug, data.status || 'active', createdAt]
  )

  return { ...data, id, slug, createdAt }
}

export const updateCategory = async (id: string, data: BlogCategoryFormData): Promise<BlogCategory | undefined> => {
  const slug = toSlug(data.slug || data.name)
  await pool.query(
    'UPDATE blog_categories SET name = ?, slug = ?, status = ? WHERE id = ?',
    [data.name || '', slug, data.status || 'active', id]
  )
  return { ...data, id, slug, createdAt: new Date().toISOString() }
}

export const deleteCategory = async (id: string): Promise<void> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.query('DELETE FROM blog_categories WHERE id = ?', [id])
    await connection.query('UPDATE blog_posts SET category_id = ? WHERE category_id = ?', ['', id])
    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export const findCategory = async (id: string): Promise<BlogCategory | undefined> => {
  const categories = await readCategories()
  return categories.find((category) => category.id === id)
}
