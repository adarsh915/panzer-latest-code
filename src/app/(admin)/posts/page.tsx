import { Metadata } from 'next'
import PostsPanel from './PostsPanel'

export const metadata: Metadata = { title: 'Blog Posts' }

const PostsPage = () => <PostsPanel />

export default PostsPage
