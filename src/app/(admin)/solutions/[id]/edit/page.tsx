import { Metadata } from 'next'
import SolutionFormPage from '../../SolutionFormPage'

export const metadata: Metadata = { title: 'Edit Solution & Service' }

type Props = {
  params: Promise<{ id: string }>
}

const EditSolutionPage = async ({ params }: Props) => {
  const { id } = await params
  return <SolutionFormPage mode="edit" solutionId={id} />
}

export default EditSolutionPage
