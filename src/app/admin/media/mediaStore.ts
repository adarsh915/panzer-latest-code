'use server'

import pool from '@/lib/db'
import { MediaItem } from '@/data/panzer/mock'

// Legacy function for backward compatibility
export const readMedia = async (): Promise<MediaItem[]> => {
  const result = await readMediaPaginated(1, 1000)
  return result.items
}

// New paginated function - CRITICAL: Only select needed columns, exclude large base64 data for list view
export const readMediaPaginated = async (page: number = 1, limit: number = 20): Promise<{ items: MediaItem[], total: number }> => {
  const offset = (page - 1) * limit
  
  // Get total count
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM media_items')
  const total = (countRows as any[])[0]?.total || 0
  
  // Get paginated results - Load full URL for now (will need migration to file paths later)
  const [rows] = await pool.query(
    'SELECT id, filename, file_type, size_kb, url, alt_text, created_at FROM media_items ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )
  
  const items = (rows as any[]).map(row => ({
    id: row.id,
    filename: row.filename,
    type: row.file_type,
    sizeKb: row.size_kb,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    url: row.url,
    altText: row.alt_text,
  }))
  
  return { items, total }
}

export const createMedia = async (data: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> => {
  const id = `m${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  await pool.query(
    'INSERT INTO media_items (id, filename, file_type, size_kb, url, alt_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.filename, data.type, data.sizeKb, data.url || '', data.altText || '', createdAt]
  )

  return {
    ...data,
    id,
    createdAt,
  }
}

export const updateMedia = async (id: string, data: Partial<MediaItem>): Promise<MediaItem | undefined> => {
  if (data.filename !== undefined) {
    await pool.query('UPDATE media_items SET filename = ? WHERE id = ?', [data.filename, id])
  }
  if (data.altText !== undefined) {
    await pool.query('UPDATE media_items SET alt_text = ? WHERE id = ?', [data.altText, id])
  }

  const [rows] = await pool.query('SELECT * FROM media_items WHERE id = ?', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return {
    id: row.id,
    filename: row.filename,
    type: row.file_type,
    sizeKb: row.size_kb,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    url: row.url,
    altText: row.alt_text,
  }
}

export const deleteMedia = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM media_items WHERE id = ?', [id])
}
