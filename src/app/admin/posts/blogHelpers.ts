import type {
  BlogCategory,
  BlogCategoryFormData,
  BlogPost,
  BlogPostFormData,
} from './blogTypes'

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const emptyBlogPost: BlogPostFormData = {
  title: '',
  slug: '',
  status: 'draft',
  author: '',
  authorBio: '',
  description: '',
  image: '',
  imageTitle: '',
  imageCaption: '',
  imageDescription: '',
  imageAlt: '',
  categoryId: '',
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
  authorBio: post.authorBio ?? '',
  description: post.description ?? '',
  image: post.image ?? '',
  imageTitle: post.imageTitle ?? '',
  imageCaption: post.imageCaption ?? '',
  imageDescription: post.imageDescription ?? '',
  imageAlt: post.imageAlt ?? post.title,
  categoryId: post.categoryId ?? '',
  tags: post.tags ?? [],
  metaTitle: post.metaTitle ?? '',
  metaDescription: post.metaDescription ?? '',
  metaKeywords: post.metaKeywords ?? '',
  publishedAt: post.publishedAt ?? '',
})
