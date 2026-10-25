import Link from 'next/link'
import Logo from './Logo'
import { buildFooterColumns, socialLinks } from '@/lib/nav'
import type { SiteSettings } from '@/sanity/types'

interface Props {
  settings: SiteSettings
  categories: { title: string; slug: string }[]
}

export default function SiteFooter({ settings, categories }: Props) {
  const columns = buildFooterColumns(settings, categories)
  const social = socialLinks(settings)
  const year = new Date().getFullYear()
  const copyright = settings.footer.copyright?.trim() || `© ${year} ${settings.siteName}. All rights reserved.`
  const showAmazonNotice = settings.modules.affiliate && Boolean(settings.affiliate.amazonTag)

  return (
    <footer className="mt-16 bg-surface-raised border-t border-surface-border">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="md:max-w-sm">
            <Logo settings={settings} />
            {(settings.footer.blurb || settings.tagline) && (
              <p className="mt-3 text-sm leading-relaxed text-text-muted max-w-sm">{settings.footer.blurb || settings.tagline}</p>
            )}
            {social.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                {social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center min-h-[44px] text-sm font-medium text-text-muted hover:text-brand-primary">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-8">
          {columns.slice(0, 4).map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-text-primary mb-3">{col.title}</h2>
              <ul className="space-y-0.5">
                {col.links.map((l) => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link
                      href={l.href}
                      {...(l.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="inline-flex items-center min-h-[40px] text-sm text-text-muted hover:text-brand-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-border text-xs leading-relaxed text-text-muted space-y-1.5">
          {showAmazonNotice && <p>As an Amazon Associate we earn from qualifying purchases.</p>}
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
