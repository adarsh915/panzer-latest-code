import { Metadata } from 'next'
import TablePage from '@/components/panzer/TablePage'
import { Lead, MOCK_LEADS } from '@/data/panzer/mock'

export const metadata: Metadata = { title: 'Leads' }

const LeadsPage = () => {
  return (
    <TablePage<Lead>
      title="Leads"
      subTitle="Panzer IT"
      rows={MOCK_LEADS}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', format: 'dateTime' },
      ]}
    />
  )
}

export default LeadsPage
