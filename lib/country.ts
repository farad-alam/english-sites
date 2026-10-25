/**
 * One site targets one country. Pick it in Sanity → Site Settings → Country.
 * It drives <html lang>, hreflang, og:locale, JSON-LD inLanguage, date format,
 * the Amazon store used for ASIN links, and the legal wording on default pages.
 *
 * To support another English-speaking market, add an entry here and to
 * COUNTRY_OPTIONS in sanity/schemas/siteSettings.ts.
 */
export type CountryCode = 'en-US' | 'en-GB' | 'en-CA' | 'en-AU'

export interface CountryConfig {
  code: CountryCode
  label: string
  flag: string
  /** <html lang> and JSON-LD inLanguage */
  htmlLang: string
  /** hreflang value */
  hreflang: string
  /** Open Graph locale */
  ogLocale: string
  currency: string
  currencySymbol: string
  /** Amazon store used when an affiliate link is just an ASIN */
  amazonDomain: string
  /** Name of the local Amazon affiliate programme */
  amazonProgram: string
  spelling: 'us' | 'uk'
  /** Regulator whose endorsement guidance the affiliate disclosure follows */
  adRegulator: string
  /** Privacy law named on the default privacy page */
  privacyLaw: string
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  'en-US': {
    code: 'en-US',
    label: 'United States',
    flag: '🇺🇸',
    htmlLang: 'en-US',
    hreflang: 'en-us',
    ogLocale: 'en_US',
    currency: 'USD',
    currencySymbol: '$',
    amazonDomain: 'amazon.com',
    amazonProgram: 'Amazon Associates',
    spelling: 'us',
    adRegulator: 'the U.S. Federal Trade Commission (FTC)',
    privacyLaw: 'applicable U.S. state privacy laws (such as the CCPA/CPRA)',
  },
  'en-GB': {
    code: 'en-GB',
    label: 'United Kingdom',
    flag: '🇬🇧',
    htmlLang: 'en-GB',
    hreflang: 'en-gb',
    ogLocale: 'en_GB',
    currency: 'GBP',
    currencySymbol: '£',
    amazonDomain: 'amazon.co.uk',
    amazonProgram: 'Amazon Associates',
    spelling: 'uk',
    adRegulator: 'the UK Advertising Standards Authority (ASA) and Competition and Markets Authority (CMA)',
    privacyLaw: 'the UK GDPR and the Data Protection Act 2018',
  },
  'en-CA': {
    code: 'en-CA',
    label: 'Canada',
    flag: '🇨🇦',
    htmlLang: 'en-CA',
    hreflang: 'en-ca',
    ogLocale: 'en_CA',
    currency: 'CAD',
    currencySymbol: '$',
    amazonDomain: 'amazon.ca',
    amazonProgram: 'Amazon Associates',
    spelling: 'uk',
    adRegulator: "Canada's Competition Bureau",
    privacyLaw: 'PIPEDA and applicable provincial privacy laws',
  },
  'en-AU': {
    code: 'en-AU',
    label: 'Australia',
    flag: '🇦🇺',
    htmlLang: 'en-AU',
    hreflang: 'en-au',
    ogLocale: 'en_AU',
    currency: 'AUD',
    currencySymbol: '$',
    amazonDomain: 'amazon.com.au',
    amazonProgram: 'Amazon Associates',
    spelling: 'uk',
    adRegulator: 'the Australian Competition and Consumer Commission (ACCC)',
    privacyLaw: 'the Australian Privacy Act 1988',
  },
}

export const DEFAULT_COUNTRY: CountryCode = 'en-US'

export function getCountry(code?: string | null): CountryConfig {
  return COUNTRIES[(code as CountryCode) ?? DEFAULT_COUNTRY] ?? COUNTRIES[DEFAULT_COUNTRY]
}
