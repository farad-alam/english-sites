import { notFound } from 'next/navigation'
import BlogView, { blogMetadata } from '../../view'

export const revalidate = false

type Params = { page: string }

// Pages are rendered on first visit, then cached until the Sanity webhook expires them.
export function generateStaticParams() {
  return []
}

function parse(page: string): number {
  const n = Number(page)
  return Number.isInteger(n) && n >= 2 ? n : NaN
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const n = parse((await params).page)
  return Number.isNaN(n) ? {} : blogMetadata(n)
}

export default async function BlogPageN({ params }: { params: Promise<Params> }) {
  const n = parse((await params).page)
  if (Number.isNaN(n)) notFound()
  return <BlogView page={n} />
}
