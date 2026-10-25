import StaticPage, { staticPageMetadata } from '@/components/layout/StaticPage'

export const revalidate = false
export const generateMetadata = () => staticPageMetadata('about')

export default function Page() {
  return <StaticPage pageKey="about" />
}
