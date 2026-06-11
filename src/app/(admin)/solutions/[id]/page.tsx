import { Metadata } from 'next'
import SolutionViewPage from '../SolutionViewPage'

export const metadata: Metadata = { title: 'View Solution & Service' }

type Props = {
  params: Promise<{ id: string }>
}

const ViewSolutionPage = async ({ params }: Props) => {
  const { id } = await params
  return <SolutionViewPage solutionId={id} />
}

export default ViewSolutionPage
