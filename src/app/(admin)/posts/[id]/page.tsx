import { Metadata } from 'next'
import PostViewPage from '../PostViewPage'

export const metadata: Metadata = { title: 'View Blog Post' }

type Props = {
  params: Promise<{ id: string }>
}

const ViewPostPage = async ({ params }: Props) => {
  const { id } = await params
  return <PostViewPage postId={id} />
}

export default ViewPostPage
