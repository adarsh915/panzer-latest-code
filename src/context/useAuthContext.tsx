'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type AdminRole = 'admin' | 'editor'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
}

type AuthContextValue = {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (params: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AUTH_STORAGE_KEY = 'PANZER_ADMIN_SESSION'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

const readSession = (): AdminUser | null => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize synchronously from localStorage — no blank screen flash
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window === 'undefined') return null
    return readSession()
  })
  const [isLoading] = useState(false)

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Invalid credentials')
    }

    const nextUser: AdminUser = await res.json()
    // Cache user info in localStorage for client-side display only.
    // Real auth is enforced by the httpOnly cookie + server-side middleware.
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    }
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
