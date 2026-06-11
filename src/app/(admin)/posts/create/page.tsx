import { Metadata } from 'next'
import PostFormPage from '../PostFormPage'

export const metadata: Metadata = { title: 'Add Blog Post' }

const CreatePostPage = () => <PostFormPage mode="create" />

export default CreatePostPage
