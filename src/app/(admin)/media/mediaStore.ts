'use server'

import pool from '@/lib/db'
import { MediaItem } from '@/data/panzer/mock'

export const readMedia = async (): Promise<MediaItem[]> => {
  const [rows] = await pool.query('SELECT * FROM media_items ORDER BY created_at DESC')
  return (rows as any[]).map(row => ({
    id: row.id,
    filename: row.filename,
    type: row.file_type,
    sizeKb: row.size_kb,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    url: row.url,
    altText: row.alt_text,
  }))
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
