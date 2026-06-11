import { Metadata } from 'next'
import TablePage from '@/components/panzer/TablePage'
import { Download, MOCK_DOWNLOADS } from '@/data/panzer/mock'

export const metadata: Metadata = { title: 'Downloads' }

const DownloadsPage = () => {
  return (
    <TablePage<Download>
      title="Downloads"
      subTitle="Panzer IT"
      rows={MOCK_DOWNLOADS}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'downloadCount', label: 'Downloads' },
        { key: 'createdAt', label: 'Created', format: 'dateTime' },
      ]}
    />
  )
}

export default DownloadsPage
