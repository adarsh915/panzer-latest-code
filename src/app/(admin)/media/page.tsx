import { Metadata } from 'next'
import TablePage from '@/components/panzer/TablePage'
import { MediaItem, MOCK_MEDIA } from '@/data/panzer/mock'

export const metadata: Metadata = { title: 'Media Library' }

const MediaPage = () => {
  return (
    <TablePage<MediaItem>
      title="Media Library"
      subTitle="Panzer IT"
      rows={MOCK_MEDIA}
      columns={[
        { key: 'filename', label: 'File' },
        { key: 'type', label: 'Type' },
        { key: 'sizeKb', label: 'Size', format: 'fileSizeKb' },
        { key: 'createdAt', label: 'Created', format: 'dateTime' },
      ]}
    />
  )
}

export default MediaPage
