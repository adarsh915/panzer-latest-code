import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/sessionToken'

// Middleware runs on the default Edge runtime.
// We use HMAC-signed cookies (Web Crypto API) — no DB call needed here.
// Forged cookies are rejected by HMAC verification without touching the database.

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const cookieValue = request.cookies.get('admin_session')?.value
 
    // No cookie → redirect to login (or return 401 for API routes)
    if (!cookieValue) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
 
    // Verify the HMAC signature — rejects forged cookies instantly, no DB call
    const rawToken = await verifyToken(cookieValue)
    if (!rawToken) {
      // Invalid or forged cookie → clear it and redirect/respond
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin_session')
      return response
    }
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
