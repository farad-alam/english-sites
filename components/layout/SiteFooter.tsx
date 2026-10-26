import Link from 'next/link'
import Logo from './Logo'
import SocialIcon from '@/components/ui/SocialIcon'
import { buildFooterColumns, socialLinks, type MenuItem } from '@/lib/nav'
import type { NavCategory, SiteSettings } from '@/sanity/types'

interface Props {
  settings: SiteSettings
  categories: NavCategory[]
}

// Static strings so Tailwind can see every class. 1 brand block + up to 4 link columns.
const GRID: Record<number, string> = {
  0: 'lg:grid-cols-1',
  1: 'lg:grid-cols-[1.6fr_1fr]',
  2: 'lg:grid-cols-[1.6fr_1fr_1fr]',
  3: 'lg:grid-cols-[1.7fr_1fr_1fr_1fr]',
  4: 'lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]',
}

const DEFAULT_DISCLOSURE =
  'Disclosure: This site may contain affiliate links. We may earn a commission if you make a purchase through these links at no extra cost to you.'

function FooterLink({ item, className }: { item: MenuItem; className: string }) {
  const external = /^https?:\/\//i.test(item.href) || item.href.startsWith('mailto:')
  const inner = (
    <>
      {item.icon && <span aria-hidden="true" className="w-5 shrink-0 text-center text-[15px] leading-none">{item.icon}</span>}
      <span>{item.label}</span>
    </>
  )
  return external || item.newTab ? (
    <a href={item.href} {...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={className}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  )
}

export default function SiteFooter({ settings, categories }: Props) {
  const brand = settings.footer.style !== 'light'
  const columns = buildFooterColumns(settings, categories)
  const social = socialLinks(settings)
  const year = new Date().getFullYear()
  const copyright = settings.footer.copyright?.trim() || `© ${year} ${settings.siteName}. All rights reserved.`
  const blurb = settings.footer.blurb?.trim() || settings.tagline
  const showAffiliate = settings.modules.affiliate || settings.modules.offers
  const disclosure = settings.footer.disclosure?.trim() || (showAffiliate ? DEFAULT_DISCLOSURE : '')
  const showAmazonNotice = settings.modules.affiliate && Boolean(settings.affiliate.amazonTag)

  // Two colour sets: the brand-colour footer (white text) or the quiet light one.
  const t = brand
    ? {
        wrap: 'bg-brand-primary text-on-primary',
        heading: 'text-on-primary',
        body: 'text-on-primary/85',
        link: 'text-on-primary/90 hover:text-on-primary hover:underline underline-offset-4',
        social: 'bg-on-primary/10 text-on-primary hover:bg-on-primary/20',
        rule: 'border-on-primary/15',
        small: 'text-on-primary/70',
      }
    : {
        wrap: 'bg-surface-raised text-text-primary border-t border-surface-border',
        heading: 'text-text-primary',
        body: 'text-text-muted',
        link: 'text-text-muted hover:text-brand-primary',
        social: 'bg-surface-card border border-surface-border text-text-muted hover:text-brand-primary hover:border-brand-primary/40',
        rule: 'border-surface-border',
        small: 'text-text-muted',
      }

  return (
    <footer className={`mt-16 ${t.wrap}`}>
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className={`grid gap-10 sm:grid-cols-2 ${GRID[Math.min(columns.length, 4)]}`}>
          <div className="sm:col-span-2 lg:col-span-1 lg:pe-8">
            <div className={brand ? '[&_span]:!text-on-primary' : ''}>
              <Logo settings={settings} />
            </div>
            {blurb && <p className={`mt-4 text-[15px] leading-relaxed max-w-md ${t.body}`}>{blurb}</p>}
            {social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-3">
                {social.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      aria-label={s.label}
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors ${t.social}`}
                    >
                      <SocialIcon name={s.key} size={19} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className={`font-heading text-lg font-bold mb-4 ${t.heading}`}>{col.title}</h2>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={`${l.href}-${l.label}`}>
                    <FooterLink item={l} className={`inline-flex items-center gap-2 min-h-[40px] text-[15px] transition-colors ${t.link}`} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={`mt-10 pt-6 border-t ${t.rule} flex flex-col gap-3 md:flex-row md:items-start md:justify-between text-sm ${t.small}`}>
          <p className="md:pt-0.5">{copyright}</p>
          {(disclosure || showAmazonNotice) && (
            <div className="md:max-w-xl md:text-end text-xs leading-relaxed space-y-1">
              {showAmazonNotice && <p>As an Amazon Associate we earn from qualifying purchases.</p>}
              {disclosure && <p>{disclosure}</p>}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
