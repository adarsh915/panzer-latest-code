export type BrandStatus = 'active' | 'inactive'

export type BrandPartner = {
  id: string
  name: string
  slug: string
  website: string
  category: string
  description: string
  image: string
  imageAlt?: string
  logo: string
  logoAlt?: string
  order: number
  featured: boolean
  status: BrandStatus
  createdAt: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export type BrandFormData = Omit<BrandPartner, 'id' | 'createdAt'>

export type BrandCategory = {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type BrandCategoryFormData = {
  name: string
  slug: string
  status: BrandCategory['status']
}
