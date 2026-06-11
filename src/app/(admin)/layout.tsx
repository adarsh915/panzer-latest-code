"use client"
import { ChildrenType } from '../../types/component-props'
import VerticalLayout from '@/components/layout/VerticalLayout'
import RequireAuth from '@/components/auth/RequireAuth'

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <VerticalLayout>
      <RequireAuth>{children}</RequireAuth>
    </VerticalLayout>
  )
}

export default AdminLayout
