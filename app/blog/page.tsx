import BlogView, { blogMetadata } from './view'

export const revalidate = false
export const generateMetadata = () => blogMetadata(1)

export default function BlogPage() {
  return <BlogView page={1} />
}
