'use client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ChildrenType } from '../../types/component-props'
import { EmailProvider } from '@/context/useEmailContext'
import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'

const AppProvidersWrapper = ({ children }: ChildrenType) => {

  return (
    <>
      <AuthProvider>
        <LayoutProvider>
          <EmailProvider>
            {children}
            <ToastContainer theme="colored" />
          </EmailProvider>
        </LayoutProvider>
      </AuthProvider>
    </>
  )
}
export default AppProvidersWrapper
