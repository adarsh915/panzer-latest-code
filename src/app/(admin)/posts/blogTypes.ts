export type PostStatus = 'draft' | 'published'

export type BlogPost = {
  id: string
  title: string
  slug: string
  status: PostStatus
  createdAt: string
  publishedAt?: string
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
