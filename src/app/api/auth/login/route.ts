import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/sessionToken'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body ?? {}

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Look up user from the real database
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, password FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    if (!rows || rows.length === 0) {
      // Same message for wrong email or wrong password — prevents user enumeration
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const user = rows[0]

    // Verify bcrypt-hashed password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Generate a cryptographically random raw token (64 hex chars)
    const rawToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    const expiresAtMysql = expiresAt.toISOString().slice(0, 19).replace('T', ' ')

    // Store raw token in DB (used for logout invalidation & session tracking)
    await pool.query(
      'INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
      [rawToken, user.id, expiresAtMysql]
    )

    // Sign the token: cookie value = "rawToken.hmacSignature"
    // Middleware verifies the HMAC — forged cookies are rejected without a DB call
    const signedCookieValue = await signToken(rawToken)

    // Set the HMAC-signed session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', signedCookieValue, {
      httpOnly: true,                                    // Not accessible from JS
      secure: process.env.NODE_ENV === 'production',    // HTTPS only in prod
      sameSite: 'strict',                               // No cross-site sending
      path: '/',
      maxAge: 24 * 60 * 60,                            // 1 day in seconds
    })

    return NextResponse.json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'admin',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
