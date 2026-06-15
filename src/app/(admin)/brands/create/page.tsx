import type { Metadata } from 'next'
import BrandFormPage from '../BrandFormPage'

export const metadata: Metadata = { title: 'Add Brand & Partner' }

const CreateBrandPage = () => <BrandFormPage mode="create" />

export default CreateBrandPage
