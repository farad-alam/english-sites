import PortableText from '@/components/blog/PortableText'
import SectionHeading from '@/components/ui/SectionHeading'
import type { RichTextSection, SiteSettings } from '@/sanity/types'

export default function RichText({ section, settings }: { section: RichTextSection; settings: SiteSettings }) {
  if (!section.body?.length) return null
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <SectionHeading title={section.title} />}
        <div className="article-body">
          <PortableText value={section.body} settings={settings} />
        </div>
      </div>
    </section>
  )
}
