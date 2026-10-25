import StaticPage, { staticPageMetadata } from '@/components/layout/StaticPage'

export const revalidate = false
export const generateMetadata = () => staticPageMetadata('privacy')

export default function Page() {
  return <StaticPage pageKey="privacy" />
}
