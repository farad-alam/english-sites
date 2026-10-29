import StaticPage, { staticPageMetadata } from '@/components/layout/StaticPage'
import ContactForm from '@/components/contact/ContactForm'

export const revalidate = false
export const generateMetadata = () => staticPageMetadata('contact')

/**
 * The form appears only when the site is set up to send mail.
 * Build variable CONTACT_FORM=on, plus the secret RESEND_API_KEY on the Worker.
 * Optional spam check: NEXT_PUBLIC_TURNSTILE_SITE_KEY (build) + TURNSTILE_SECRET_KEY (secret).
 */
export default function Page() {
  const formEnabled = process.env.CONTACT_FORM === 'on'
  return (
    <StaticPage
      pageKey="contact"
      footer={formEnabled ? <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} /> : null}
    />
  )
}
