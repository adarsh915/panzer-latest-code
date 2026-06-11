import { Metadata } from 'next'
import SolutionFormPage from '../SolutionFormPage'

export const metadata: Metadata = { title: 'Add Solution & Service' }

const CreateSolutionPage = () => <SolutionFormPage mode="create" />

export default CreateSolutionPage
