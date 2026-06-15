'use server'

import pool from '@/lib/db'
import type { LeadStatus, WebsiteLead } from './leadTypes'

export type { LeadStatus, WebsiteLead }

export const readLeads = async (): Promise<WebsiteLead[]> => {
  const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    service: row.service ?? '',
    serviceLabel: row.service_label ?? '',
    message: row.message ?? '',
    status: row.status,
    pageTitle: row.page_title ?? '',
    pageUrl: row.page_url ?? '',
    referrer: row.referrer ?? '',
    read: Boolean(row.is_read),
    readAt: row.read_at instanceof Date ? row.read_at.toISOString() : (row.read_at || ''),
    submittedAt: row.submitted_at ? (row.submitted_at instanceof Date ? row.submitted_at.toISOString() : row.submitted_at) : (row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<void> => {
  await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, id])
}

export const markLeadRead = async (id: string): Promise<void> => {
  const readAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await pool.query('UPDATE leads SET is_read = 1, read_at = ? WHERE id = ? AND is_read = 0', [readAt, id])
}

export const deleteLead = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM leads WHERE id = ?', [id])
}
