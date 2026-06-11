import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import ColorThemeSettingsPanel from './ColorThemeSettingsPanel'

export const metadata: Metadata = { title: 'Color Theme Settings' }

const ColorThemeSettingsPage = () => {
  return (
    <>
      <PageTitle title="Color Theme" subTitle="Setting" />
      <ColorThemeSettingsPanel />
    </>
  )
}

export default ColorThemeSettingsPage
