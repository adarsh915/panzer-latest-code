import { Metadata } from 'next'
import TablePage from '@/components/panzer/TablePage'
import { AdminUserRow, MOCK_USERS } from '@/data/panzer/mock'

export const metadata: Metadata = { title: 'Admin Users' }

const UsersPage = () => {
  return (
    <TablePage<AdminUserRow>
      title="Admin Users"
      subTitle="Panzer IT"
      rows={MOCK_USERS}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'active', label: 'Active', format: 'boolean' },
      ]}
    />
  )
}

export default UsersPage
