"use client"
import { ChildrenType } from '../../types/component-props'
import VerticalLayout from '@/components/layout/VerticalLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper'

// Load minimal admin CSS (80KB instead of 546KB)
import '@/assets/scss/admin-core.scss'

const AdminLayout = ({ children }: ChildrenType) => {

  return (
    <AppProvidersWrapper>
      <VerticalLayout>
        <RequireAuth>{children}</RequireAuth>
      </VerticalLayout>
    </AppProvidersWrapper>
  )
}

export default AdminLayout
