'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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
  logout: () => void
}

const AUTH_STORAGE_KEY = 'PANZER_ADMIN_SESSION'

/**
 * Frontend-only demo auth:
 * - No backend calls
 * - Stores a simple "session" in localStorage
 */
const DEMO_CREDENTIALS = {
  email: 'admin@panzer.local',
  password: 'Admin@12345',
} as const

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
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(readSession())
    setIsLoading(false)
  }, [])

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    // Strict demo creds (change here if you want "any password works")
    const ok = email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password
    if (!ok) throw new Error('Invalid demo credentials')

    const nextUser: AdminUser = {
      id: 'demo-admin-1',
      name: 'Panzer Admin',
      email,
      role: 'admin',
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
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

export { DEMO_CREDENTIALS }

