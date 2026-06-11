import { MOCK_POSTS, type Post, type PostStatus } from '@/data/panzer/mock'

export type BlogPost = Post & {
  author?: string
  description?: string
  image?: string
  imageAlt?: string
  categoryId?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export type BlogPostFormData = {
  title: string
  slug: string
  status: PostStatus
  author: string
  description: string
  image: string
  imageAlt: string
  categoryId: string
  tags: string[]
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  publishedAt?: string
}

export type BlogCategory = {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type BlogCategoryFormData = {
  name: string
  slug: string
  status: BlogCategory['status']
}

const POSTS_STORAGE_KEY = 'PANZER_BLOG_POSTS'
const CATEGORIES_STORAGE_KEY = 'PANZER_BLOG_CATEGORIES'

export const emptyBlogPost: BlogPostFormData = {
  title: '',
  slug: '',
  status: 'draft',
  author: '',
  description: '',
  image: '',
  imageAlt: '',
  categoryId: 'blog-security',
  tags: [],
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  publishedAt: '',
}

export const emptyBlogCategory: BlogCategoryFormData = {
  name: '',
  slug: '',
  status: 'active',
}

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getInitialPosts = (): BlogPost[] =>
  MOCK_POSTS.map((post) => ({
    ...post,
    author: post.id === 'p1' ? 'Security Team' : 'Content Editor',
    description: `<p>Draft description for ${post.title}</p>`,
    image: '',
    imageAlt: post.title,
    categoryId: post.id === 'p1' ? 'blog-security' : 'blog-engineering',
    tags: post.id === 'p1' ? ['api security', 'express'] : ['nosql', 'database'],
    metaTitle: post.title,
    metaDescription: `Read ${post.title} on the Panzer IT blog.`,
    metaKeywords: post.id === 'p1' ? 'api security, express security, checklist' : 'nosql injection, database security',
  }))

export const getInitialCategories = (): BlogCategory[] => [
  {
    id: 'blog-security',
    name: 'Security',
    slug: 'security',
    status: 'active',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'blog-engineering',
    name: 'Engineering',
    slug: 'engineering',
    status: 'active',
    createdAt: '2026-05-01T10:05:00Z',
  },
]

export const readPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') return getInitialPosts()

  try {
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY)
    if (!raw) return getInitialPosts()
    const parsed = JSON.parse(raw) as BlogPost[]
    return Array.isArray(parsed) ? parsed : getInitialPosts()
  } catch {
    return getInitialPosts()
  }
}

export const writePosts = (posts: BlogPost[]) => {
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts))
}

export const readCategories = (): BlogCategory[] => {
  if (typeof window === 'undefined') return getInitialCategories()

  try {
    const raw = window.localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (!raw) return getInitialCategories()
    const parsed = JSON.parse(raw) as BlogCategory[]
    return Array.isArray(parsed) ? parsed : getInitialCategories()
  } catch {
    return getInitialCategories()
  }
}

export const writeCategories = (categories: BlogCategory[]) => {
  window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
}

export const createPost = (data: BlogPostFormData) => {
  const posts = readPosts()
  const nextPost: BlogPost = {
    ...data,
    id: `p${Date.now()}`,
    slug: toSlug(data.slug || data.title),
    createdAt: new Date().toISOString(),
    publishedAt: data.status === 'published' ? data.publishedAt || new Date().toISOString() : '',
  }

  writePosts([nextPost, ...posts])
  return nextPost
}

export const updatePost = (id: string, data: BlogPostFormData) => {
  const posts = readPosts()
  const nextPosts = posts.map((post) =>
    post.id === id
      ? {
          ...post,
          ...data,
          slug: toSlug(data.slug || data.title),
          publishedAt: data.status === 'published' ? data.publishedAt || new Date().toISOString() : '',
        }
      : post,
  )

  writePosts(nextPosts)
  return nextPosts.find((post) => post.id === id)
}

export const deletePost = (id: string) => {
  writePosts(readPosts().filter((post) => post.id !== id))
}

export const findPost = (id: string) => readPosts().find((post) => post.id === id)

export const createCategory = (data: BlogCategoryFormData) => {
  const categories = readCategories()
  const nextCategory: BlogCategory = {
    ...data,
    id: `bc${Date.now()}`,
    slug: toSlug(data.slug || data.name),
    createdAt: new Date().toISOString(),
  }

  writeCategories([nextCategory, ...categories])
  return nextCategory
}

export const updateCategory = (id: string, data: BlogCategoryFormData) => {
  const categories = readCategories()
  const nextCategories = categories.map((category) =>
    category.id === id
      ? {
          ...category,
          ...data,
          slug: toSlug(data.slug || data.name),
        }
      : category,
  )

  writeCategories(nextCategories)
  return nextCategories.find((category) => category.id === id)
}

export const deleteCategory = (id: string) => {
  writeCategories(readCategories().filter((category) => category.id !== id))
  writePosts(readPosts().map((post) => (post.categoryId === id ? { ...post, categoryId: '' } : post)))
}

export const findCategory = (id: string) => readCategories().find((category) => category.id === id)

export const toCategoryFormData = (category: BlogCategory): BlogCategoryFormData => ({
  name: category.name,
  slug: category.slug,
  status: category.status,
})

export const toFormData = (post: BlogPost): BlogPostFormData => ({
  title: post.title,
  slug: post.slug,
  status: post.status,
  author: post.author ?? '',
  description: post.description ?? '',
  image: post.image ?? '',
  imageAlt: post.imageAlt ?? post.title,
  categoryId: post.categoryId ?? '',
  tags: post.tags ?? [],
  metaTitle: post.metaTitle ?? '',
  metaDescription: post.metaDescription ?? '',
  metaKeywords: post.metaKeywords ?? '',
  publishedAt: post.publishedAt ?? '',
})
