import type { Metadata } from 'next'
import BrandViewPage from '../BrandViewPage'

export const metadata: Metadata = { title: 'View Brand & Partner' }

type Props = {
  params: Promise<{ id: string }>
}

const ViewBrandPage = async ({ params }: Props) => {
  const { id } = await params
  return <BrandViewPage brandId={id} />
}

export default ViewBrandPage
