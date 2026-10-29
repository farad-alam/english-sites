import { getCountry } from './country'
import type { SiteSettings } from '@/sanity/types'

/**
 * Ready-made wording for About / Contact / Privacy / Terms / Disclosure so a
 * brand-new site has every page AdSense reviewers look for on day one.
 * It adapts to the site's country. It is a starting point — create a "Page"
 * document in Sanity to replace any of it, and have a lawyer review the
 * legal pages before you rely on them.
 */
export interface DefaultSection {
  heading: string
  paragraphs: string[]
}

export interface DefaultPage {
  title: string
  description: string
  intro?: string
  sections: DefaultSection[]
}

export const STATIC_PAGE_KEYS = ['about', 'contact', 'privacy', 'terms', 'disclosure'] as const
export type StaticPageKey = (typeof STATIC_PAGE_KEYS)[number]

export function defaultPage(key: StaticPageKey, settings: SiteSettings): DefaultPage {
  const country = getCountry(settings.country)
  const name = settings.siteName
  const email = settings.contactEmail
  const usesAds = Boolean(settings.ads.adsenseClientId)
  const usesAnalytics = Boolean(settings.analytics.ga4Id || settings.analytics.clarityId)
  const earnsCommission = settings.modules.affiliate || settings.modules.offers
  const contactLine = email ? `You can reach us at ${email}.` : 'Use the contact details on our Contact page.'

  switch (key) {
    case 'about':
      return {
        title: `About ${name}`,
        description: `Learn who is behind ${name} and how we work.`,
        intro: settings.tagline,
        sections: [
          {
            heading: 'Who we are',
            paragraphs: [
              `${name} is an independent website written for readers in ${country.label}. We publish practical, well-researched content so you can make better decisions faster.`,
            ],
          },
          {
            heading: 'How we work',
            paragraphs: [
              'Every article is researched from primary sources and first-hand testing where possible. We update our guides when things change, and we correct mistakes as soon as we find them.',
              ...(earnsCommission
                ? ['We may earn a commission when you buy through links on our site. This never affects our editorial opinions — see our affiliate disclosure for details.']
                : []),
            ],
          },
          { heading: 'Get in touch', paragraphs: [`Spotted an error or have a suggestion? ${contactLine}`] },
        ],
      }

    case 'contact':
      return {
        title: 'Contact us',
        description: `Get in touch with the team at ${name}.`,
        intro: 'We read every message and aim to reply within a few working days.',
        sections: [
          {
            heading: 'Email',
            paragraphs: [email ? `Send us an email at ${email}.` : 'Our contact email will appear here once it is added in Site Settings.'],
          },
          {
            heading: 'What to write to us about',
            paragraphs: ['Corrections, feedback on an article, partnership or advertising enquiries, and press requests are all welcome. We cannot give personal financial, legal or medical advice.'],
          },
        ],
      }

    case 'privacy':
      return {
        title: 'Privacy Policy',
        description: `How ${name} collects, uses and protects your information.`,
        intro: `This policy explains what information ${name} collects when you visit our website and how it is used. It is written with ${country.privacyLaw} in mind.`,
        sections: [
          {
            heading: 'Information we collect',
            paragraphs: [
              'Like most websites, our servers automatically receive standard log information such as your IP address, browser type, device type, the pages you visit and the time of your visit. We do not ask you to create an account or collect payment details.',
              'If you contact us, we keep your message and email address so we can reply.',
            ],
          },
          {
            heading: 'Cookies and similar technologies',
            paragraphs: [
              'Cookies are small files stored on your device. We and our partners use them to keep the site working, understand how it is used, and show advertising. You can block or delete cookies in your browser settings; some features may then work less well.',
              ...(usesAnalytics ? ['We use analytics tools (such as Google Analytics and Microsoft Clarity) to learn which pages are useful. They collect usage data such as pages viewed and approximate location, in aggregate form.'] : []),
            ],
          },
          ...(usesAds
            ? [
                {
                  heading: 'Advertising',
                  paragraphs: [
                    'We use Google AdSense to display ads. Google and its partners use cookies to serve ads based on your visits to this and other websites. You can opt out of personalised advertising at adssettings.google.com, or at www.aboutads.info.',
                    'If you are in the United Kingdom or European Economic Area, we ask for your consent before using cookies for personalised advertising and measurement; you can change your choice at any time using the privacy settings control on the site.',
                  ],
                },
              ]
            : []),
          ...(earnsCommission
            ? [
                {
                  heading: 'Affiliate links',
                  paragraphs: [
                    'Some links on our site are affiliate links. When you click one, the retailer or network may place a cookie so they can credit us for a qualifying purchase. See our Affiliate Disclosure for more.',
                  ],
                },
              ]
            : []),
          {
            heading: 'Third-party links',
            paragraphs: ['Our content links to other websites. We are not responsible for their content or privacy practices, so please read their policies.'],
          },
          {
            heading: 'Your rights',
            paragraphs: [
              `Depending on where you live, ${country.privacyLaw} may give you rights to access, correct or delete personal information we hold about you, and to object to certain processing. To exercise them, ${contactLine.charAt(0).toLowerCase()}${contactLine.slice(1)}`,
            ],
          },
          {
            heading: 'Children',
            paragraphs: ['Our website is not directed at children under 13 and we do not knowingly collect their personal information.'],
          },
          {
            heading: 'Changes to this policy',
            paragraphs: ['We may update this policy from time to time. The latest version is always published on this page.'],
          },
        ],
      }

    case 'terms':
      return {
        title: 'Terms of Use',
        description: `The terms that apply when you use ${name}.`,
        intro: `By using ${name} you agree to these terms. If you do not agree, please do not use the site.`,
        sections: [
          {
            heading: 'Information only',
            paragraphs: [
              'Our content is for general information and entertainment. It is not professional financial, legal, medical or other advice. Always check details with the provider and consult a qualified professional where appropriate.',
              ...(settings.termsNotice ? [settings.termsNotice] : []),
            ],
          },
          {
            heading: 'Accuracy',
            paragraphs: ['We work hard to keep information accurate and current, but prices, specifications and availability change. We give no guarantee that everything on the site is complete or up to date.'],
          },
          {
            heading: 'Intellectual property',
            paragraphs: [`All text, images and design on ${name} belong to us or our licensors. You may share short quotes with a link back to the original page, but may not copy or republish our content without permission.`],
          },
          {
            heading: 'Links to other sites',
            paragraphs: ['We link to websites we do not control and are not responsible for their content, products or services.'],
          },
          {
            heading: 'Limitation of liability',
            paragraphs: ['To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of, or reliance on, this website.'],
          },
          {
            heading: 'Governing law',
            paragraphs: [`These terms are governed by the laws of ${country.label}.`],
          },
        ],
      }

    case 'disclosure':
      return {
        title: 'Affiliate Disclosure',
        description: `How ${name} earns money and how that affects our content.`,
        intro: `${name} is reader-supported. Here is exactly how we make money and how we keep our opinions independent.`,
        sections: [
          {
            heading: 'How we earn',
            paragraphs: [
              'Some links on our site are affiliate links. If you click one and make a purchase or sign up, we may receive a commission from the retailer or provider at no additional cost to you.',
              ...(settings.affiliate.amazonTag ? [`${name} participates in the ${country.amazonProgram} programme (${country.amazonDomain}). As an Amazon Associate we earn from qualifying purchases.`] : []),
            ],
          },
          {
            heading: 'Our editorial independence',
            paragraphs: [
              'Commissions never determine which products we recommend or how we rate them. We recommend products we believe are genuinely useful, and we say so plainly when something is not worth buying.',
            ],
          },
          {
            heading: 'Why we disclose',
            paragraphs: [`We follow the endorsement and advertising guidance of ${country.adRegulator}, which asks publishers to be clear when they have a financial relationship with a product they feature.`],
          },
        ],
      }
  }
}
