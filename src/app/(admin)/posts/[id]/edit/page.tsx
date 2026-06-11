import { Metadata } from 'next'
import PostFormPage from '../../PostFormPage'

export const metadata: Metadata = { title: 'Edit Blog Post' }

type Props = {
  params: Promise<{ id: string }>
}

const EditPostPage = async ({ params }: Props) => {
  const { id } = await params
  return <PostFormPage mode="edit" postId={id} />
}

export default EditPostPage
