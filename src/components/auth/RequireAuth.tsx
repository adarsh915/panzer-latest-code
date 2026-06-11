'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/useAuthContext'

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/login?redirectTo=${encodeURIComponent(pathname || '/dashboard')}`)
    }
  }, [isLoading, isAuthenticated, router, pathname])

  if (isLoading) return null
  if (!isAuthenticated) return null
  return children
}

export default RequireAuth

