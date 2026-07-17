'use server'

import pool from '@/lib/db'
import { toSlug } from './blogHelpers'
import { sanitizeDeep, stripBase64 } from '@/lib/sanitize'
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


// Legacy function for backward compatibility
export const readPosts = async (): Promise<BlogPost[]> => {
  const result = await readPostsPaginated(1, 1000)
  return result.posts
}

// New paginated function
export const readPostsPaginated = async (page: number = 1, limit: number = 10): Promise<{ posts: BlogPost[], total: number }> => {
  const offset = (page - 1) * limit
  
  // Get total count
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM blog_posts')
  const total = (countRows as any[])[0]?.total || 0
  
  // Get paginated results
  const [rows] = await pool.query(
    'SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )
  
  const posts = (rows as any[]).map((row) => sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    author: row.author ?? '',
    authorBio: row.author_bio ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
    imageAlt: row.image_alt ?? '',
    categoryId: row.category_id ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
  }))
  
  return { posts, total }
}

export const createPost = async (data: BlogPostFormData): Promise<BlogPost | { success: false, message: string }> => {
  const id = `p${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.title)

  const [existing] = await pool.query('SELECT id FROM blog_posts WHERE slug = ? OR title = ?', [slug, data.title || ''])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A blog post with this title or slug already exists.` }
  }

  const publishedAt = data.status === 'published'
    ? (data.publishedAt || new Date().toISOString()).slice(0, 19).replace('T', ' ')
    : null

  await pool.query(
    `INSERT INTO blog_posts (id, title, slug, status, author, author_bio, description, image, image_title, image_caption, image_description, image_alt, category_id, tags, meta_title, meta_description, meta_keywords, published_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title || '',
      slug,
      data.status || 'draft',
      data.author || '',
      data.authorBio || '',
      data.description || '',
      data.image ? stripBase64(data.image) : '',
      data.imageTitle || '',
      data.imageCaption || '',
      data.imageDescription || '',
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

export const updatePost = async (id: string, data: BlogPostFormData): Promise<BlogPost | undefined | { success: false, message: string }> => {
  const slug = toSlug(data.slug || data.title)

  const [existing] = await pool.query('SELECT id FROM blog_posts WHERE (slug = ? OR title = ?) AND id != ?', [slug, data.title || '', id])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A blog post with this title or slug already exists.` }
  }

  const publishedAt = data.status === 'published'
    ? (data.publishedAt || new Date().toISOString()).slice(0, 19).replace('T', ' ')
    : null

  await pool.query(
    `UPDATE blog_posts SET title = ?, slug = ?, status = ?, author = ?, author_bio = ?, description = ?, image = ?, image_title = ?, image_caption = ?, image_description = ?, image_alt = ?, category_id = ?, tags = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, published_at = ? WHERE id = ?`,
    [
      data.title || '',
      slug,
      data.status || 'draft',
      data.author || '',
      data.authorBio || '',
      data.description || '',
      data.image ? stripBase64(data.image) : '',
      data.imageTitle || '',
      data.imageCaption || '',
      data.imageDescription || '',
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

  return {
    ...data,
    id,
    slug,
    createdAt: new Date().toISOString(),
    publishedAt: publishedAt ?? '',
  }
}

export const deletePost = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM blog_posts WHERE id = ?', [id])
}

export const findPost = async (id: string): Promise<BlogPost | undefined> => {
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    author: row.author ?? '',
    authorBio: row.author_bio ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
    imageAlt: row.image_alt ?? '',
    categoryId: row.category_id ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
  })
}


export const findPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const posts = await readPosts()
  return posts.find((post) => post.slug === slug && post.status === 'published')
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

export const createCategory = async (data: BlogCategoryFormData): Promise<BlogCategory | { success: false, message: string }> => {
  const id = `bc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.name)

  const [existing] = await pool.query('SELECT id FROM blog_categories WHERE slug = ? OR name = ?', [slug, data.name || ''])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

  await pool.query(
    'INSERT INTO blog_categories (id, name, slug, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name || '', slug, data.status || 'active', createdAt]
  )

  return { ...data, id, slug, createdAt }
}

export const updateCategory = async (id: string, data: BlogCategoryFormData): Promise<BlogCategory | undefined | { success: false, message: string }> => {
  const slug = toSlug(data.slug || data.name)

  const [existing] = await pool.query('SELECT id FROM blog_categories WHERE (slug = ? OR name = ?) AND id != ?', [slug, data.name || '', id])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

  await pool.query(
    'UPDATE blog_categories SET name = ?, slug = ?, status = ? WHERE id = ?',
    [data.name || '', slug, data.status || 'active', id]
  )
  return { ...data, id, slug, createdAt: new Date().toISOString() }
}

export const deleteCategory = async (id: string): Promise<void | { success: false, message: string }> => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    // Check usage
    const [posts] = await connection.query('SELECT COUNT(*) as count FROM blog_posts WHERE category_id = ?', [id])
    const count = (posts as any[])[0].count
    if (count > 0) {
      await connection.rollback()
      return { success: false, message: `Cannot delete. This category is used in ${count} Blog(s).` }
    }

    await connection.query('DELETE FROM blog_categories WHERE id = ?', [id])
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
