import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import FontSettingsPanel from './FontSettingsPanel'

export const metadata: Metadata = { title: 'Font Settings' }

const FontSettingsPage = () => {
  return (
    <>
      <PageTitle title="Font Settings" subTitle="Setting" />
      <FontSettingsPanel />
    </>
  )
}

export default FontSettingsPage
