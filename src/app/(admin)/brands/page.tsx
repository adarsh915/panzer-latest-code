import { Metadata } from 'next'
import TablePage from '@/components/panzer/TablePage'
import { Brand, MOCK_BRANDS } from '@/data/panzer/mock'

export const metadata: Metadata = { title: 'Brands & Partners' }

const BrandsPage = () => {
  return (
    <TablePage<Brand>
      title="Brands & Partners"
      subTitle="Panzer IT"
      rows={MOCK_BRANDS}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'website', label: 'Website' },
        { key: 'featured', label: 'Featured', format: 'boolean' },
      ]}
    />
  )
}

export default BrandsPage
