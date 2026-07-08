import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { verifyToken } from '@/lib/sessionToken'

// Helper function to get the current user from the session cookie
async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value
  
  if (!sessionCookie) return null

  const rawToken = await verifyToken(sessionCookie)
  if (!rawToken) return null

  // Get user_id from session
  const [sessionRows]: any = await pool.query(
    'SELECT user_id FROM admin_sessions WHERE token = ? AND expires_at > NOW() LIMIT 1',
    [rawToken]
  )

  if (!sessionRows || sessionRows.length === 0) return null

  const userId = sessionRows[0].user_id

  // Get user details
  const [userRows]: any = await pool.query(
    'SELECT id, name, email, password FROM users WHERE id = ? LIMIT 1',
    [userId]
  )

  if (!userRows || userRows.length === 0) return null

  return userRows[0]
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body ?? {}

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    // Changing email/name requires verifying the current password
    if (!currentPassword) {
      return NextResponse.json({ message: 'Current password is required to make changes' }, { status: 400 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 403 })
    }

    // Check if they also want to change the password
    let updatedPasswordHash = user.password
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 })
      }
      updatedPasswordHash = await bcrypt.hash(newPassword, 10)
    }

    // Check if new email is already taken by another user
    if (email !== user.email) {
      const [existingUsers]: any = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
        [email, user.id]
      )
      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json({ message: 'Email is already in use' }, { status: 409 })
      }
    }

    // Update the database
    await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
      [name, email, updatedPasswordHash, user.id]
    )

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id.toString(),
        name,
        email,
      }
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
