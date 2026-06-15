export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'spam'

export type WebsiteLead = {
  id: string
  name: string
  email: string
  service: string
  serviceLabel: string
  message: string
  status: LeadStatus
  pageTitle: string
  pageUrl: string
  referrer?: string
  read: boolean
  readAt?: string
  submittedAt: string
  createdAt: string
}
