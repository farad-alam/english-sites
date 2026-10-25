import { notFound } from 'next/navigation'
import CategoryView, { categoryMetadata } from '../../view'

export const revalidate = false

type Params = { slug: string; page: string }

// Pages are rendered on first visit, then cached until the Sanity webhook expires them.
export function generateStaticParams() {
  return []
}

function parse(page: string): number {
  const n = Number(page)
  return Number.isInteger(n) && n >= 2 ? n : NaN
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, page } = await params
  const n = parse(page)
  return Number.isNaN(n) ? {} : categoryMetadata(slug, n)
}

export default async function CategoryPageN({ params }: { params: Promise<Params> }) {
  const { slug, page } = await params
  const n = parse(page)
  if (Number.isNaN(n)) notFound()
  return <CategoryView slug={slug} page={n} />
}
