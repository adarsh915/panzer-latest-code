import { redirect } from 'next/navigation'

// Header & Footer settings are combined on one page
const FooterSettingsPage = () => {
  redirect('/settings/header')
}

export default FooterSettingsPage
