import type { Metadata } from 'next'
import LeadsPanel from './LeadsPanel'

export const metadata: Metadata = { title: 'Leads' }

const LeadsPage = () => <LeadsPanel />

export default LeadsPage
