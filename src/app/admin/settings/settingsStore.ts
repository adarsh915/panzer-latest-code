'use server'

import pool from '@/lib/db'

export const readSetting = async <T>(key: string, defaultValue: T): Promise<T> => {
  const [rows] = await pool.query('SELECT value FROM site_settings WHERE `key` = ?', [key])
  const row = (rows as any[])[0]
  if (!row) return defaultValue

  try {
    const parsed = JSON.parse(row.value)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return { ...defaultValue, ...parsed } as T
    }
    return parsed as T
  } catch {
    return defaultValue
  }
}

export const writeSetting = async <T>(key: string, value: T): Promise<void> => {
  const jsonValue = JSON.stringify(value)
  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  await pool.query(
    'INSERT INTO site_settings (`key`, value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?, updated_at = ?',
    [key, jsonValue, updatedAt, jsonValue, updatedAt]
  )
}
