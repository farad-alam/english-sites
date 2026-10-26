/**
 * Demo content used by:
 *   - scripts/dev/mock-sanity.ts  → serves it from memory so the whole site can be tested offline
 *   - scripts/seed.ts             → writes it to a real Sanity dataset ("npm run seed")
 *
 * Everything here is fictional placeholder content. Images are plain URLs
 * (the `externalUrl` field) so no asset upload is needed.
 */

type Doc = Record<string, unknown> & { _id: string; _type: string }

let counter = 0
const k = () => `k${(counter++).toString(36)}`

const span = (text: string, marks: string[] = []) => ({ _type: 'span', _key: k(), text, marks })
const block = (text: string, style = 'normal', extra: Record<string, unknown> = {}) => ({
  _type: 'block',
  _key: k(),
  style,
  markDefs: [],
  children: [span(text)],
  ...extra,
})
const h2 = (t: string) => block(t, 'h2')
const h3 = (t: string) => block(t, 'h3')
const p = (t: string) => block(t)
const li = (t: string) => block(t, 'normal', { listItem: 'bullet', level: 1 })
const linkPara = (before: string, label: string, href: string, after: string) => {
  const markKey = k()
  return {
    _type: 'block',
    _key: k(),
    style: 'normal',
    markDefs: [{ _type: 'link', _key: markKey, href, blank: true, sponsored: false }],
    children: [span(before), span(label, [markKey]), span(after)],
  }
}

const ref = (id: string) => ({ _type: 'reference', _ref: id })
const img = (seed: string, alt: string) => ({ _type: 'image', externalUrl: `https://picsum.photos/seed/${seed}/1200/800`, alt })

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

const LOREM = [
  'Most people overthink this decision. A clear checklist, a realistic budget and a little patience will take you further than any spec sheet.',
  'We tested each option for at least two weeks in a normal working routine, rather than relying on a quick unboxing or the manufacturer’s own claims.',
  'Prices move around a lot, so treat any figure in this guide as a snapshot and check the current price before you buy.',
  'If you only remember one thing from this section, make it this: buy for the way you actually work, not the way a product page imagines you work.',
  'There is no single best choice for everyone. The right pick depends on your space, your budget and how much you are willing to tinker.',
  'A common mistake is paying for features you will never touch. Start with the basics and upgrade only when you hit a real limit.',
  'Reliability matters more than novelty. A boring product that works every day beats an exciting one that needs constant attention.',
  'Warranty terms are worth reading. The best brands stand behind their products for years, and it shows in how they answer support emails.',
]
const para = (i: number) => p(LOREM[i % LOREM.length])
const paras = (from: number, n: number) => Array.from({ length: n }, (_, i) => para(from + i))

// ── Authors ─────────────────────────────────────────────────────────────────

const authors: Doc[] = [
  {
    _id: 'author-sam',
    _type: 'author',
    firstName: 'Sam',
    lastName: 'Rivera',
    slug: { current: 'sam-rivera' },
    jobTitle: 'Senior Editor',
    shortBio: 'Sam has spent a decade testing home-office gear and writes about what is actually worth the money.',
    expertiseAreas: ['Home office', 'Ergonomics', 'Smart home'],
    yearsExperience: 10,
    avatar: { externalUrl: 'https://picsum.photos/seed/sam/200/200', alt: 'Sam Rivera' },
    linkedin: 'https://www.linkedin.com/in/example-sam',
    x: 'https://x.com/example_sam',
  },
  {
    _id: 'author-jo',
    _type: 'author',
    firstName: 'Jo',
    lastName: 'Okafor',
    slug: { current: 'jo-okafor' },
    jobTitle: 'Software Reviewer',
    shortBio: 'Jo reviews productivity software and has migrated more teams between tools than they would like to admit.',
    expertiseAreas: ['Productivity software', 'Remote work'],
    yearsExperience: 6,
  },
]

// ── Categories ──────────────────────────────────────────────────────────────

const categories: Doc[] = [
  { _id: 'cat-office', _type: 'category', title: 'Home Office', slug: { current: 'home-office' }, description: 'Desks, chairs and everything that makes working from home comfortable.', icon: '🏠', order: 1 },
  { _id: 'cat-smart', _type: 'category', title: 'Smart Home', slug: { current: 'smart-home' }, description: 'Plugs, switches and sensors that earn their place on your wall.', icon: '💡', order: 2 },
  { _id: 'cat-software', _type: 'category', title: 'Software & Tools', slug: { current: 'software-tools' }, description: 'Apps and services that save time without adding complexity.', icon: '💻', order: 3 },
  { _id: 'cat-desk', _type: 'category', title: 'Standing Desks', slug: { current: 'standing-desks' }, description: 'Sit-stand desks, tested.', icon: '🪑', order: 4, parent: ref('cat-office') },
]

// ── Affiliate links ─────────────────────────────────────────────────────────

const affiliateLinks: Doc[] = [
  { _id: 'link-ergochair', _type: 'affiliateLink', name: 'ErgoChair Pro (Amazon)', slug: { current: 'ergochair-pro' }, kind: 'amazon', asin: 'B0DEMO1234' },
  { _id: 'link-liftdesk', _type: 'affiliateLink', name: 'LiftDesk Max (Amazon)', slug: { current: 'liftdesk-max' }, kind: 'amazon', asin: 'B0DEMO5678' },
  { _id: 'link-taskflow', _type: 'affiliateLink', name: 'TaskFlow', slug: { current: 'taskflow' }, kind: 'url', url: 'https://example.com/taskflow?ref=demo' },
  { _id: 'link-notenest', _type: 'affiliateLink', name: 'NoteNest', slug: { current: 'notenest' }, kind: 'url', url: 'https://example.com/notenest?aff=demo' },
]

// ── Offers ──────────────────────────────────────────────────────────────────

const offers: Doc[] = [
  {
    _id: 'offer-taskflow',
    _type: 'offer',
    name: 'TaskFlow',
    slug: { current: 'taskflow' },
    tagline: 'Plain-English project boards for small teams',
    rating: 4.6,
    startingPrice: '$8 / user / month',
    pricingModel: 'freemium',
    freeTrial: '14-day free trial',
    bestFor: 'Small teams that outgrew spreadsheets',
    promoCode: 'DEMO20',
    promoNote: '20% off the first year',
    featured: true,
    order: 1,
    url: 'https://example.com/taskflow',
    link: ref('link-taskflow'),
    category: ref('cat-software'),
    author: ref('author-jo'),
    summary: 'TaskFlow keeps projects simple: boards, due dates and comments, without the setup tax of heavier tools.',
    features: ['Kanban and list views', 'Recurring tasks', 'Slack and email integrations', 'Guest access'],
    pros: ['Quick to learn', 'Fair free plan', 'Clean mobile apps'],
    cons: ['Limited reporting', 'No built-in time tracking'],
    publishedAt: daysAgo(30),
    body: [
      h2('What TaskFlow does well'),
      p('TaskFlow is built around a single idea: a project is a list of things with owners and dates. Everything else is optional.'),
      p('That focus makes onboarding fast. Most teams we asked were productive within an afternoon.'),
      h2('Where it falls short'),
      p('Reporting is basic. If you need burn-down charts or resource planning, look at heavier tools.'),
    ],
  },
  {
    _id: 'offer-notenest',
    _type: 'offer',
    name: 'NoteNest',
    slug: { current: 'notenest' },
    tagline: 'Notes and docs that stay organised on their own',
    rating: 4.3,
    startingPrice: 'Free, paid from $5 / month',
    pricingModel: 'freemium',
    freeTrial: 'Free plan available',
    bestFor: 'Personal knowledge bases',
    featured: false,
    order: 2,
    link: ref('link-notenest'),
    category: ref('cat-software'),
    author: ref('author-jo'),
    summary: 'A tidy notes app with sensible defaults and fast search.',
    features: ['Fast full-text search', 'Web clipper', 'Offline mode'],
    pros: ['Excellent search', 'Generous free plan'],
    cons: ['Collaboration is limited'],
    publishedAt: daysAgo(20),
    body: [p('NoteNest is the app we would hand to someone who just wants their notes in one place.')],
  },
  {
    _id: 'offer-mailpilot',
    _type: 'offer',
    name: 'MailPilot',
    slug: { current: 'mailpilot' },
    tagline: 'Email newsletters without the learning curve',
    rating: 4.1,
    startingPrice: '$12 / month',
    pricingModel: 'paid',
    bestFor: 'Creators sending a weekly newsletter',
    featured: true,
    order: 3,
    url: 'https://example.com/mailpilot',
    category: ref('cat-software'),
    author: ref('author-jo'),
    summary: 'Simple newsletter tooling with decent deliverability.',
    pros: ['Simple editor'],
    cons: ['Pricey at scale'],
    publishedAt: daysAgo(10),
  },
]

// ── Posts ───────────────────────────────────────────────────────────────────

const standingDeskTable = {
  _type: 'productComparisonTable',
  _key: k(),
  heading: 'Our top standing desks',
  products: [
    { _key: k(), name: 'LiftDesk Max', verdict: 'best-overall', rating: 4.8, price: '$499', pros: ['Quiet motor', 'Very stable at full height'], cons: ['Assembly takes an hour'], link: ref('link-liftdesk') },
    { _key: k(), name: 'RiseBasic 2', verdict: 'best-budget', rating: 4.2, price: '$229', pros: ['Great price', 'Simple controls'], cons: ['Wobbles above 45 inches'], url: 'https://example.com/risebasic' },
    { _key: k(), name: 'ArcPro Walnut', verdict: 'best-premium', rating: 4.6, price: '$849', pros: ['Gorgeous top', 'Memory presets'], cons: ['Expensive'], asin: 'B0DEMO9999' },
  ],
}

const faq = {
  _type: 'faqBlock',
  _key: k(),
  items: [
    { _key: k(), question: 'How tall should my standing desk go?', answer: 'Measure your standing elbow height and add a couple of centimetres for your keyboard. Most adjustable desks cover 70–120 cm.' },
    { _key: k(), question: 'Are electric standing desks loud?', answer: 'Good ones sit around 45 dB while moving, roughly the sound of a quiet conversation.' },
    { _key: k(), question: 'Can I put a standing desk on carpet?', answer: 'Yes. Use the manufacturer’s levelling feet and avoid very thick pile, which can cause rocking.' },
  ],
}

const posts: Doc[] = [
  {
    _id: 'post-standing-desks',
    _type: 'post',
    title: 'Best Standing Desks in 2026: Tested and Ranked',
    slug: { current: 'best-standing-desks' },
    excerpt: 'We tested a dozen sit-stand desks for stability, noise and value. These are the ones we would buy again.',
    mainImage: img('desk', 'A tidy home office with an adjustable standing desk'),
    category: ref('cat-desk'),
    author: ref('author-sam'),
    publishedAt: daysAgo(3),
    updatedAt: daysAgo(1),
    articleType: 'comparison',
    keywords: ['best standing desk', 'sit stand desk'],
    affiliateDisclosure: true,
    body: [
      p('A good standing desk changes how your workday feels. A bad one wobbles, whines and ends up as an expensive shelf.'),
      linkPara('Not sure whether you need one at all? Start with our ', 'home office setup guide', '/home-office-on-a-budget', ' and come back.'),
      p('We tested twelve desks over two months. Here is what we found.'),
      h2('The short list'),
      standingDeskTable,
      h2('How we tested'),
      ...paras(0, 4),
      h3('Stability'),
      ...paras(2, 3),
      h3('Noise'),
      ...paras(4, 3),
      li('Under 50 dB while moving is good'),
      li('Under 45 dB is excellent'),
      h2('Buying advice'),
      {
        _type: 'productCard',
        _key: k(),
        name: 'LiftDesk Max',
        badge: 'Best overall',
        rating: 4.8,
        price: '$499',
        description: 'Dual-motor frame with 4 memory presets and a 3-stage leg for a wide height range.',
        imageUrl: 'https://picsum.photos/seed/liftdesk/400/400',
        link: ref('link-liftdesk'),
      },
      ...paras(1, 5),
      { _type: 'calloutBlock', _key: k(), type: 'tip', text: 'Check the weight rating if you run multiple monitors. 100 kg is a sensible minimum.' },
      { _type: 'prosConsBlock', _key: k(), pros: ['Better posture variety', 'Quiet, stable motors', 'Long warranties'], cons: ['Higher price than fixed desks', 'Some assembly'] },
      h2('Frequently asked questions'),
      faq,
    ],
  },
  {
    _id: 'post-ergochair-review',
    _type: 'post',
    title: 'ErgoChair Pro Review: Is It Worth the Money?',
    slug: { current: 'ergochair-pro-review' },
    excerpt: 'After six weeks of daily use, here is our honest take on the ErgoChair Pro: comfort, build quality and who should buy it.',
    mainImage: img('chair', 'The ErgoChair Pro in a home office'),
    category: ref('cat-office'),
    author: ref('author-sam'),
    publishedAt: daysAgo(6),
    articleType: 'review',
    overallRating: 4.5,
    reviewedItem: { name: 'ErgoChair Pro', brand: 'ErgoCo' },
    affiliateDisclosure: true,
    body: [
      p('The ErgoChair Pro costs more than most office chairs. After six weeks of daily use, we think it mostly earns that price.'),
      h2('Comfort'),
      ...paras(0, 3),
      h2('Build quality'),
      ...paras(3, 3),
      { _type: 'prosConsBlock', _key: k(), pros: ['Excellent lumbar support', 'Breathable mesh', '12-year warranty'], cons: ['Armrests feel plasticky', 'Heavy to move'] },
      {
        _type: 'productCard',
        _key: k(),
        name: 'ErgoChair Pro',
        badge: 'Editor’s choice',
        rating: 4.5,
        price: '$349',
        description: 'Adjustable lumbar, 4D arms and a breathable mesh back.',
        asin: 'B0DEMO1234',
        link: ref('link-ergochair'),
      },
      h2('Verdict'),
      ...paras(6, 2),
    ],
  },
  {
    _id: 'post-home-office-budget',
    _type: 'post',
    title: 'How to Set Up a Home Office on a Budget',
    slug: { current: 'home-office-on-a-budget' },
    excerpt: 'A practical, step-by-step plan for building a comfortable workspace without overspending.',
    mainImage: img('budget', 'A simple desk setup with a laptop and a lamp'),
    category: ref('cat-office'),
    author: ref('author-sam'),
    publishedAt: daysAgo(12),
    articleType: 'howto',
    body: [
      p('You do not need a four-figure budget to work comfortably from home. You need a plan.'),
      h2('Step 1: Pick the spot'),
      ...paras(0, 3),
      h2('Step 2: Sort out the chair'),
      ...paras(3, 3),
      { _type: 'calloutBlock', _key: k(), type: 'warning', text: 'Do not skimp on the chair. Back pain is expensive.' },
      h2('Step 3: Lighting'),
      ...paras(5, 4),
      h2('Step 4: Cable management'),
      ...paras(1, 4),
      h2('Step 5: Add the extras'),
      ...paras(2, 4),
      li('A footrest'),
      li('A second monitor'),
      li('A small plant'),
      ...paras(0, 3),
    ],
  },
  {
    _id: 'post-project-tools',
    _type: 'post',
    title: 'Best Project Management Tools for Small Teams',
    slug: { current: 'best-project-management-tools' },
    excerpt: 'Three simple tools that keep small teams organised without a week of setup.',
    mainImage: img('tools', 'A kanban board on a laptop screen'),
    category: ref('cat-software'),
    author: ref('author-jo'),
    publishedAt: daysAgo(9),
    articleType: 'listicle',
    affiliateDisclosure: true,
    body: [
      p('Small teams do not need enterprise software. They need something everyone will actually open.'),
      h2('TaskFlow'),
      { _type: 'offerCard', _key: k(), offer: ref('offer-taskflow') },
      ...paras(0, 2),
      h2('NoteNest'),
      { _type: 'offerCard', _key: k(), offer: ref('offer-notenest') },
      ...paras(2, 2),
      h2('MailPilot'),
      { _type: 'offerCard', _key: k(), offer: ref('offer-mailpilot') },
      ...paras(4, 2),
    ],
  },
  {
    _id: 'post-smart-plugs',
    _type: 'post',
    title: 'Smart Plug vs Smart Switch: Which Should You Buy?',
    slug: { current: 'smart-plug-vs-smart-switch' },
    excerpt: 'Both make a dumb device smart. Here is how to choose between them.',
    mainImage: img('plug', 'A smart plug in a wall socket'),
    category: ref('cat-smart'),
    author: ref('author-jo'),
    publishedAt: daysAgo(15),
    articleType: 'informational',
    body: [p('Smart plugs are easy. Smart switches are neat. Which one is right depends on the room.'), h2('Smart plugs'), ...paras(0, 3), h2('Smart switches'), ...paras(3, 3)],
  },
  {
    _id: 'post-noindex',
    _type: 'post',
    title: 'Thin Page That Should Not Be Indexed',
    slug: { current: 'thin-noindex-page' },
    excerpt: 'Used to test noindex handling.',
    category: ref('cat-smart'),
    author: ref('author-jo'),
    publishedAt: daysAgo(2),
    noIndex: true,
    noAds: true,
    body: [p('This page has noindex and no ads.')],
  },
  {
    _id: 'post-future',
    _type: 'post',
    title: 'Scheduled Post From The Future',
    slug: { current: 'scheduled-future-post' },
    excerpt: 'Must not appear anywhere before its publish date.',
    category: ref('cat-smart'),
    author: ref('author-jo'),
    publishedAt: daysAhead(10),
    body: [p('You should not see this yet.')],
  },
  // A draft — the mock API (like Sanity's "published" perspective) must hide it.
  {
    _id: 'drafts.post-standing-desks',
    _type: 'post',
    title: 'DRAFT TITLE THAT MUST NOT LEAK',
    slug: { current: 'best-standing-desks' },
    excerpt: 'draft',
    category: ref('cat-desk'),
    author: ref('author-sam'),
    publishedAt: daysAgo(3),
    body: [p('draft body')],
  },
]

// ── Static pages (only About is customised; the rest use built-in defaults) ──

const staticPages: Doc[] = [
  {
    _id: 'page-about',
    _type: 'staticPage',
    key: 'about',
    title: 'About Cozy Desk Co.',
    description: 'Who we are and how we test.',
    intro: 'Independent reviews for people who work from home.',
    body: [h2('Our mission'), p('We help people build a workspace that feels good to be in.'), h2('How we make money'), p('Some links earn us a commission at no extra cost to you.')],
  },
]

// ── Site settings ───────────────────────────────────────────────────────────

const siteSettings: Doc = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'Cozy Desk Co.',
  tagline: 'Honest reviews for a better home office',
  country: 'en-GB',
  contactEmail: 'hello@example.com',
  modules: { blog: true, affiliate: true, offers: true },
  theme: { preset: 'ocean', headingFont: 'jakarta', bodyFont: 'inter', radius: 'soft' },
  nav: {
    // All categories (automatic), then two extra items: the menu order is whatever the editor drags it to.
    items: [
      { _type: 'autoCategories', _key: k(), showSubcategories: true },
      { _type: 'navLink', _key: k(), label: 'Deals', href: '/offers' },
      { _type: 'pageLink', _key: k(), page: '/contact' },
    ],
    maxVisible: 6,
    ctaLabel: 'Top picks',
    ctaHref: '/best-standing-desks',
  },
  footer: {
    style: 'brand',
    blurb: 'Independent reviews for people who work from home.',
    columns: [
      { _type: 'footerCategoriesColumn', _key: k(), title: 'Categories', limit: 8, showIcons: true },
      {
        _type: 'footerLinksColumn',
        _key: k(),
        title: 'Quick Links',
        links: [
          { _type: 'pageLink', _key: k(), page: '/about' },
          { _type: 'pageLink', _key: k(), page: '/contact' },
          { _type: 'pageLink', _key: k(), page: '/disclosure' },
          { _type: 'pageLink', _key: k(), page: '/privacy' },
          { _type: 'pageLink', _key: k(), page: '/terms' },
        ],
      },
      {
        _type: 'footerLinksColumn',
        _key: k(),
        title: 'Contact',
        links: [{ _type: 'navLink', _key: k(), label: 'Get in touch →', href: '/contact' }],
      },
    ],
    copyright: 'Cozy Desk Co.',
  },
  social: { x: 'https://x.com/example', youtube: 'https://youtube.com/@example' },
  ads: {
    adsenseClientId: 'ca-pub-1234567890123456',
    autoAds: false,
    topSlot: '1111111111',
    inArticleSlot: '2222222222',
    sidebarSlot: '3333333333',
    consentMode: 'google-cmp',
    extraAdsTxt: 'example.com, 12345, DIRECT',
  },
  affiliate: { amazonTag: 'cozydesk-21', autoDisclosure: true },
  analytics: { ga4Id: 'G-TEST123456', clarityId: 'abcd1234', googleVerification: 'google-demo-token' },
  seo: { titleTemplate: '%s | Cozy Desk Co.', defaultDescription: 'Independent reviews for a better home office.' },
  homeSections: [
    { _type: 'heroSection', _key: 'h1', eyebrow: 'Independent reviews', heading: 'Work from home, comfortably', subheading: 'Tested desks, chairs and tools — no fluff.', variant: 'centered', overlay: 'medium', showSearch: true, showTopics: true, image: { _type: 'image', externalUrl: 'https://picsum.photos/seed/hero-desk/1600/900', alt: '' }, primaryCta: { label: 'Browse reviews', href: '/blog' } },
    { _type: 'trendingPostsSection', _key: 'h1b', title: 'Trending articles', posts: [ref('post-standing-desks'), ref('post-ergochair-review'), ref('post-home-office-budget'), ref('post-project-tools'), ref('post-smart-plugs')] },
    {
      _type: 'topPicksSection',
      _key: 'h2',
      title: 'Our top picks',
      items: [
        { _key: k(), badge: 'Best overall', title: 'LiftDesk Max', summary: 'The standing desk we would buy again.', rating: 4.8, image: { externalUrl: 'https://picsum.photos/seed/pick1/600/400', alt: 'LiftDesk Max' }, post: ref('post-standing-desks'), ctaLabel: 'Read review' },
        { _key: k(), badge: 'Editor’s choice', title: 'ErgoChair Pro', summary: 'Supportive, breathable and built to last.', rating: 4.5, post: ref('post-ergochair-review') },
        { _key: k(), badge: 'Best value', title: 'LiftDesk Max (Amazon)', summary: 'Direct link through a managed affiliate link.', rating: 4.8, link: ref('link-liftdesk'), ctaLabel: 'Check price' },
      ],
    },
    { _type: 'topOffersSection', _key: 'h3', title: 'Top software deals', count: 3 },
    { _type: 'latestPostsSection', _key: 'h4', title: 'Recently published', count: 6, showViewAll: true },
    { _type: 'featuredPostsSection', _key: 'h5', title: 'Featured articles', posts: [ref('post-project-tools'), ref('post-smart-plugs')] },
    { _type: 'categoryShelvesSection', _key: 'h6', title: 'Browse by topic', categories: [ref('cat-office'), ref('cat-software')], postsPerShelf: 3 },
    { _type: 'categoryGridSection', _key: 'h7', title: 'Explore topics' },
    { _type: 'trustSection', _key: 'h8', items: [{ _key: k(), icon: 'shield', title: 'Independent', text: 'We buy or borrow our own products.' }, { _key: k(), icon: 'refresh', title: 'Kept up to date', text: 'Guides are re-tested regularly.' }, { _key: k(), icon: 'star', title: 'Honest ratings', text: 'We say when something is not worth it.' }] },
    { _type: 'richTextSection', _key: 'h9', title: 'Why trust us?', body: [p('Every recommendation comes from hands-on testing.')] },
    { _type: 'faqSection', _key: 'h10', title: 'Frequently asked questions', items: [{ _key: k(), question: 'Do you accept free products?', answer: 'Sometimes, but it never influences ratings and we always say so.' }] },
    { _type: 'ctaSection', _key: 'h11', heading: 'Ready to upgrade your desk?', text: 'Start with our top-rated standing desk.', buttonLabel: 'See the winners', buttonHref: '/best-standing-desks' },
    // A disabled section — must not render.
    { _type: 'ctaSection', _key: 'h12', heading: 'DISABLED SECTION MUST NOT RENDER', disabled: true },
  ],
}

export function buildDemoDataset(): Doc[] {
  return [siteSettings, ...authors, ...categories, ...affiliateLinks, ...offers, ...posts, ...staticPages]
}
