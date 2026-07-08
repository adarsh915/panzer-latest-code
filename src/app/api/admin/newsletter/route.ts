import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id])
    return NextResponse.json({ message: 'Subscriber deleted successfully' })
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
