/**
 * Edge-compatible session token signing/verification using Web Crypto API.
 * No Node.js native modules — safe to use in Next.js Middleware.
 *
 * Token format stored in cookie: `rawToken.hmacSignature`
 *  - rawToken: 64-char random hex (stored in DB)
 *  - hmacSignature: HMAC-SHA256(rawToken, SECRET) encoded as hex
 *
 * This means:
 *  - Forged cookies fail HMAC check → rejected without any DB call
 *  - Middleware is fast and Edge-compatible
 *  - Logout still deletes the rawToken from the DB
 */

const SECRET = process.env.PANZER_SESSION_SECRET

function getActiveSecret() {
  if (process.env.NODE_ENV === 'production' && !SECRET) {
    throw new Error('FATAL: PANZER_SESSION_SECRET must be set in production. Refusing to start for security reasons.')
  }
  return SECRET || 'panzer-dev-secret-CHANGE-IN-PRODUCTION'
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getActiveSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/**
 * Signs a rawToken and returns the full cookie value: `rawToken.hmacSignature`
 */
export async function signToken(rawToken: string): Promise<string> {
  const key = await getHmacKey()
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawToken))
  return `${rawToken}.${bytesToHex(sig)}`
}

/**
 * Verifies a cookie value (`rawToken.hmacSignature`).
 * Returns the rawToken if valid, or null if forged/malformed.
 */
export async function verifyToken(cookieValue: string): Promise<string | null> {
  try {
    const dotIndex = cookieValue.indexOf('.')
    if (dotIndex === -1) return null

    const rawToken = cookieValue.substring(0, dotIndex)
    const sigHex = cookieValue.substring(dotIndex + 1)

    if (!rawToken || !sigHex) return null

    const key = await getHmacKey()
    const enc = new TextEncoder()
    const sigBytes = hexToBytes(sigHex)

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes as any, enc.encode(rawToken))
    return valid ? rawToken : null
  } catch {
    return null
  }
}
