import CategoryView, { categoryMetadata } from './view'
import { getCategories } from '@/sanity/queries'

export const revalidate = false

export async function generateStaticParams() {
  try {
    return (await getCategories()).map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return categoryMetadata((await params).slug, 1)
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CategoryView slug={(await params).slug} page={1} />
}
