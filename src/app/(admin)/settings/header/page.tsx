import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import HeaderFooterSettingsPanel from './HeaderFooterSettingsPanel'

export const metadata: Metadata = { title: 'Header & Footer Settings' }

const HeaderFooterSettingsPage = () => {
  return (
    <>
      <PageTitle title="Header & Footer" subTitle="Setting" />
      <HeaderFooterSettingsPanel />
    </>
  )
}

export default HeaderFooterSettingsPage
