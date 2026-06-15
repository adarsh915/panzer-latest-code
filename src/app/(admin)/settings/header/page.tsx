import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import HeaderFooterSettingsPanel from './HeaderFooterSettingsPanel'

export const metadata: Metadata = { title: 'Header Settings' }

const HeaderFooterSettingsPage = () => {
  return (
    <>
      <PageTitle title="Header Settings" subTitle="Setting" />
      <HeaderFooterSettingsPanel />
    </>
  )
}

export default HeaderFooterSettingsPage
