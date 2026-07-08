import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body ?? {}

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
    }

    // Insert email into database, ignore if it already exists
    await pool.query(
      `INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)`,
      [email]
    )

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter!' }, { status: 200 })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
