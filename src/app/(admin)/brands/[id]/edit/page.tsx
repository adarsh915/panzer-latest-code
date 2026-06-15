import type { Metadata } from 'next'
import BrandFormPage from '../../BrandFormPage'

export const metadata: Metadata = { title: 'Edit Brand & Partner' }

type Props = {
  params: Promise<{ id: string }>
}

const EditBrandPage = async ({ params }: Props) => {
  const { id } = await params
  return <BrandFormPage mode="edit" brandId={id} />
}

export default EditBrandPage
