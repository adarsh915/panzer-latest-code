import { MOCK_SOLUTIONS } from '@/data/panzer/mock'

export type SolutionStatus = 'active' | 'inactive'

export type SolutionFeatureCard = {
  id: string
  icon: string
  image?: string
  imageAlt?: string
  title: string
  description: string
}

export type SolutionImplementationStep = {
  id: string
  step: string
  title: string
  description: string
}

export type SolutionService = {
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  image: string
  imageAlt?: string
  slug: string
  order: number
  status: SolutionStatus
  createdAt: string
  featureCards: SolutionFeatureCard[]
  implementationSteps: SolutionImplementationStep[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export type SolutionFormData = Omit<SolutionService, 'id' | 'createdAt'>

const SOLUTIONS_STORAGE_KEY = 'PANZER_SOLUTIONS_SERVICES'

export const solutionCategories = ['Security', 'Data Protection', 'Backup', 'Monitoring', 'Identity']

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const createDefaultFeatureCards = (): SolutionFeatureCard[] => [
  {
    id: 'feature-data-protection',
    icon: 'tabler:shield',
    title: 'Data Protection',
    description: 'Prevent leakage across endpoints, users, cloud channels and business workflows.',
  },
  {
    id: 'feature-access-control',
    icon: 'tabler:user-lock',
    title: 'Access Control',
    description: 'Strengthen IAM, PAM, PSM and database access management for critical systems.',
  },
  {
    id: 'feature-recovery-readiness',
    icon: 'tabler:refresh',
    title: 'Recovery Readiness',
    description: 'Keep virtual, physical, cloud and SaaS workloads available with reliable backup planning.',
  },
  {
    id: 'feature-threat-prevention',
    icon: 'tabler:bug-off',
    title: 'Threat Prevention',
    description: 'Reduce malware, ransomware, zero-day and vulnerability exposure with layered protection.',
  },
]

const createDefaultImplementationSteps = (): SolutionImplementationStep[] => [
  {
    id: 'step-assess',
    step: '01',
    title: 'Assess',
    description: 'Review current tools, risks, data movement, users and compliance expectations.',
  },
  {
    id: 'step-recommend',
    step: '02',
    title: 'Recommend',
    description: 'Select the right security, backup and data protection products for the environment.',
  },
  {
    id: 'step-deploy',
    step: '03',
    title: 'Deploy',
    description: 'Coordinate implementation with practical controls, policy alignment and vendor support.',
  },
  {
    id: 'step-optimize',
    step: '04',
    title: 'Optimize',
    description: 'Improve visibility, recoverability and protection posture as business needs change.',
  },
]

export const emptySolution: SolutionFormData = {
  title: '',
  subtitle: '',
  description: '',
  category: 'Security',
  image: '',
  imageAlt: '',
  slug: '',
  order: 1,
  status: 'active',
  featureCards: createDefaultFeatureCards(),
  implementationSteps: createDefaultImplementationSteps(),
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
}

export const getInitialSolutions = (): SolutionService[] =>
  MOCK_SOLUTIONS.map((solution) => ({
    ...solution,
    createdAt: '2026-05-01T10:00:00Z',
    imageAlt: solution.title,
    featureCards: createDefaultFeatureCards(),
    implementationSteps: createDefaultImplementationSteps(),
    metaTitle: solution.title,
    metaDescription: solution.description,
    metaKeywords: `${solution.category}, ${solution.subtitle}, ${solution.title}`,
  }))

export const readSolutions = (): SolutionService[] => {
  if (typeof window === 'undefined') return getInitialSolutions()

  try {
    const raw = window.localStorage.getItem(SOLUTIONS_STORAGE_KEY)
    if (!raw) return getInitialSolutions()
    const parsed = JSON.parse(raw) as SolutionService[]
    return Array.isArray(parsed) ? parsed : getInitialSolutions()
  } catch {
    return getInitialSolutions()
  }
}

export const writeSolutions = (solutions: SolutionService[]) => {
  window.localStorage.setItem(SOLUTIONS_STORAGE_KEY, JSON.stringify(solutions))
}

export const createSolution = (data: SolutionFormData) => {
  const solutions = readSolutions()
  const nextSolution: SolutionService = {
    ...data,
    id: `s${Date.now()}`,
    slug: toSlug(data.slug || data.title),
    createdAt: new Date().toISOString(),
  }

  writeSolutions([nextSolution, ...solutions])
  return nextSolution
}

export const updateSolution = (id: string, data: SolutionFormData) => {
  const solutions = readSolutions()
  const nextSolutions = solutions.map((solution) =>
    solution.id === id
      ? {
          ...solution,
          ...data,
          slug: toSlug(data.slug || data.title),
        }
      : solution,
  )

  writeSolutions(nextSolutions)
  return nextSolutions.find((solution) => solution.id === id)
}

export const deleteSolution = (id: string) => {
  writeSolutions(readSolutions().filter((solution) => solution.id !== id))
}

export const findSolution = (id: string) => readSolutions().find((solution) => solution.id === id)

export const toFormData = (solution: SolutionService): SolutionFormData => ({
  title: solution.title,
  subtitle: solution.subtitle,
  description: solution.description,
  category: solution.category,
  image: solution.image,
  imageAlt: solution.imageAlt ?? solution.title,
  slug: solution.slug,
  order: solution.order,
  status: solution.status,
  featureCards: solution.featureCards ?? createDefaultFeatureCards(),
  implementationSteps: solution.implementationSteps ?? createDefaultImplementationSteps(),
  metaTitle: solution.metaTitle ?? '',
  metaDescription: solution.metaDescription ?? '',
  metaKeywords: solution.metaKeywords ?? '',
})
