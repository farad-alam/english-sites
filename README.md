# English Sites

One codebase for **English-language AdSense, affiliate and digital-product sites**.

Every site is the *same repo* deployed as its **own Cloudflare Worker** with its **own Sanity project**. Nothing is cloned or edited per site. What makes one site different from the next lives in Sanity → **Site Settings**: country, name, logo, colours and fonts, menus, ad and analytics IDs, which modules are switched on, and what the home page contains.

```
 this repo ──┬── Worker "cozy-desk"   + Sanity project "cozy-desk"   → cozydesk.com
             ├── Worker "tiny-garden" + Sanity project "tiny-garden" → tinygarden.net
             └── Worker …
```

New site = new Sanity project + new Worker + five variables. No code change. A code improvement made here reaches every site on the next deploy.

> **Parked on purpose:** the directory-site template and the client-site repo (full clone per client). This repo is only for the portfolio sites.

---

## What a site can do

| Module (switch in Site Settings) | What it turns on |
| --- | --- |
| **Blog** | Articles, categories, authors, search, pagination, reading-time, table of contents, related articles, share buttons, JSON-LD (Article, Review, FAQ, Breadcrumbs, Person). |
| **Affiliate** | Product cards, ranked comparison tables, pros/cons, `/go/<slug>` managed links (hidden from Google), Amazon links tagged per country, automatic disclosure, `rel="sponsored nofollow"`. |
| **Offers** | A directory of software / hosting / digital-product offers with promo codes, ratings and a review page each. |

Switch a module off and its pages return 404, disappear from the sitemap and menus, and its home-page sections vanish.

Always on: AdSense slots (top, in-article, sidebar, optional Auto ads), `ads.txt`, Google’s free Privacy & messaging consent banner for UK/EEA visitors, GA4, Microsoft Clarity, sitemap index, `robots.txt`, noindex controls, country-aware default legal pages (US, UK, Canada, Australia), and a **ready-made home page** you can reshape with reusable sections (see below).

---

## How it stays fast

* Every page is generated once and cached (Cloudflare R2). Visitors get stored HTML; nothing is rendered per visit.
* When you publish or edit in Sanity, a webhook expires **only the affected cache tags** (one article → that article, its category, and the lists it appears in — not the whole site).
* The theme (colours, fonts, radius) is written into the HTML on the server, so there is no flash and no extra request.
* Only the two fonts a site picked are sent, as preloaded Latin-subset files. No Google Fonts.
* Images are resized and converted to WebP/AVIF by Sanity’s CDN. No image service to pay for.
* The Studio editor is loaded only when you open `/studio`, never for visitors.
* Ads reserve their space up front, so they cannot shift the layout.

Measured locally on a phone profile (images and ad scripts blocked in the test sandbox): Lighthouse performance 95–98, accessibility 100, SEO 100, layout shift 0. The deployable bundle is ~1.4 MB compressed. Re-run PageSpeed on every real site after launch.

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local        # fill NEXT_PUBLIC_SANITY_PROJECT_ID
npm run dev                       # http://localhost:3000   (Studio at /studio)
```

Without a Sanity project the site shows a built-in setup screen. With an empty project it renders a plain starter site so you can start filling Site Settings.

Useful commands:

| Command | What it does |
| --- | --- |
| `npm run seed` | Fills Sanity with demo content (needs `SANITY_WRITE_TOKEN`). Refuses if articles already exist. |
| `npm run bulk-import -- ./articles --upload-images` | Publishes Markdown files as articles — see below. |
| `npm run cf:preview` | Builds and runs the site locally in the real Cloudflare runtime. |
| `npm run cf:deploy` | Builds and deploys from your computer (needs Cloudflare login). |
| `npm run sync-fonts` | After adding a font: copies its files into `public/fonts`. |
| `npm run lint` / `npm run typecheck` | Checks. |

---

## The built-in home page, menu and footer

A new site needs no layout work. Out of the box it gets the layout below. Every change is made in Studio → Site Settings:

| Part | What it shows | What the owner can change (Studio → Site Settings) |
| --- | --- | --- |
| **Header menu** | Every top-level category (sub-categories as a drop-down), plus Offers if that module is on. | *4 · Menu & footer → Header menu*: add, reorder or remove entries. An entry can be the automatic **All categories** block, one category, a built-in page (About, Contact…) or any custom link. Entries beyond *Items shown in the bar* collapse under a “More” drop-down. Optional button on the right. |
| **Hero** | Light, fast hero: a heading, subheading, search box, popular-topic chips and buttons over a colour or a background image (served at reduced quality, loaded first). | *Home page sections → Hero*: text, background image, overlay strength, layout, buttons. |
| **Trending articles** | Two rows of three. Hidden until the owner picks articles. | *Home page sections → Trending articles*: pick up to 6. The picker searches by title **or slug**, and shows each slug, so you can paste a URL path from Search Console. |
| **Recently published** | The newest articles in the same 3-column layout. Default 6. | *Home page sections → Recently published*: show 6, 9, 12 or 15; optionally limit to one category. |
| **Featured articles** | The “money” articles: one large card and a short list. Switched **off** by default. | *Home page sections → Featured articles*: pick up to 5 and untick *Hide this section*. |
| **Footer** | Brand colour, logo and blurb, social icons, Categories, Quick Links, Contact, copyright and affiliate disclosure. | *4 · Menu & footer → Footer*: style (brand colour or light), blurb, social links, and up to four columns — Categories or your own link lists — in any order; copyright and disclosure text. |

The *Home page* list starts pre-filled with these blocks (see `lib/home-template.ts`), so the owner edits what is there instead of starting from an empty page. More blocks (category shelves, top picks, top offers, FAQ, trust badges, rich text, call to action…) can be added from the section library. A site whose Home page list is empty falls back to the same layout.

---

## Launching a new site

The full step-by-step list is in **[docs/NEW-SITE-CHECKLIST.md](docs/NEW-SITE-CHECKLIST.md)**. In short:

1. **Sanity:** create a project (Free plan) → copy the Project ID → add a webhook to `https://<site>/api/revalidate` (projection and secret are in the checklist) → create an Editor token if you will use bulk import.
2. **Cloudflare:** create a Worker from this GitHub repo. Build variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `CF_WORKER_NAME`, optionally `CF_ROUTE` and `CF_CACHE` (`r2` default; `kv` for a test site on an account without R2). Worker secret: `SANITY_WEBHOOK_SECRET`. Build command `npm run cf:build`, deploy command `npm run cf:ship`.
3. **Open `/studio` → Site Settings:** country, name, theme, modules, menus, ad/analytics IDs.
4. Add authors, categories and articles (or `bulk-import`).
5. **Launch:** review the legal pages, submit the sitemap in Search Console, set up AdSense (`ads.txt` is generated for you) and the consent banner.

Sites are always open to search engines: `robots.txt` allows crawling and the sitemaps list every public page. To keep one article out of Google, tick *Unlisted* on it.

---

## Writing content

* **Articles:** Studio → Articles. Body supports headings, lists, links (tick *sponsored* for affiliate links), images, product cards, ranked tables, pros/cons, FAQ, callouts and offer cards. A cover image can be uploaded (recommended — served resized from Sanity) or pasted as a URL.
* **Unlisted articles:** the *Unlisted* switch (SEO tab) gives noindex **and** hides the article from lists, related posts, search and the sitemap. It stays reachable by its link.
* **Scheduling:** a future *Published at* hides the article, but nothing re-checks the date on the Free plan, so it appears only after the next publish or edit anywhere. For exact timing use Sanity’s scheduled publishing (paid plans).
* **Bulk import:** put `.md` files in a folder with this header, then run `npm run bulk-import -- ./folder --upload-images --draft` to land them as drafts for review.

  ```markdown
  ---
  title: Best Standing Desks in 2026
  category: Home Office          # created if missing
  author: Sam Rivera             # must exist (or pass --author "Name")
  publishedAt: 2026-10-01
  image: https://…/cover.jpg
  imageAlt: A tidy home office
  articleType: review
  affiliateDisclosure: true
  ---
  Markdown body…
  ```

  Tables and raw HTML are skipped with a warning (add a *Ranked comparison table* in Studio instead). Re-running skips articles that exist; `--update` overwrites them.

---

## Things to know

* **Cloudflare plan.** The Free Workers plan caps CPU time per request very low, and Next.js regeneration can exceed it. Plan on **Workers Paid ($5/month)** — one paid account covers *all* your sites’ Workers.
* **No “Cache Everything” rule.** Pages are already cached by the app; a blanket CDN rule can keep serving old HTML after you edit.
* **Sanity Free limits.** Check the current document-count and API-request limits. The caching above keeps requests low: content is fetched when a page is generated or refreshed, not per visitor.
* **Legal pages are templates.** About / Contact / Privacy / Terms / Disclosure start from sensible, country-aware text, but they are *not legal advice*. Read and edit them (Studio → Pages) before launch, especially Privacy for your ad and analytics setup.
* **Consent.** *Google CMP* mode sets consent defaults to “denied” for UK/EEA visitors and waits for Google’s free Privacy & messaging banner. You still need to create and publish that message in AdSense and keep your Privacy page accurate.
* **Affiliate programs have rules.** Amazon Associates, for example, requires its exact disclosure sentence and forbids showing live prices you do not keep fresh. Prices in cards are free text by design — keep them current or leave them empty.
* **After editing a post’s category or slug**, include `prevSlug`/`prevCategoryId` in the webhook projection (it is in the checklist) so the old pages refresh too.

---

## How it is built

```
app/                 routes (all statically cached; no cookies/searchParams on pages)
  [slug]             article
  blog, category, authors, offers, search, go/, studio, api/revalidate, sitemap*, robots.txt, ads.txt
components/          layout, blog, offers, ads, analytics, sections (home-page library), ui
sanity/              schemas (siteSettings, post, category, author, offer, affiliateLink, staticPage, blocks, sections)
                     client.ts (cached fetch + tags), queries.ts (every GROQ query + its tags), types.ts
lib/                 theme, fonts, country, settings (+ defaults), seo, schema (JSON-LD), affiliates, ads, nav…
scripts/             seed, bulk-import, generate-wrangler, sync-fonts, dev/ (mock Sanity for offline testing)
open-next.config.ts  Cloudflare cache wiring (R2 pages, Durable Objects for tags)
```

**Cache tags** (see `sanity/queries.ts` and `app/api/revalidate/route.ts`): `siteSettings`, `posts`, `post:<slug>`, `category:<id>`, `categories`, `authors`, `offers`, `offer:<slug>`, `affiliateLinks`, `staticPages`.

**Adding a home-page section:** add a schema in `sanity/schemas/sections/`, a component in `components/sections/`, register it in `components/sections/index.tsx`, and (if it needs references) project them in `getSettingsRaw`. The pre-filled layout lives in `lib/home-template.ts`; menu and footer logic in `lib/nav.ts`.

**Adding a font:** `npm i -D @fontsource-variable/<name>`, add a row in `lib/fonts.ts`, run `npm run sync-fonts`.

**Offline testing.** `npx tsx scripts/dev/mock-sanity.ts` serves the demo dataset through real GROQ evaluation; point the site at it with `SANITY_API_HOST=http://localhost:4455 NEXT_PUBLIC_SANITY_PROJECT_ID=demo`. `scripts/dev/send-webhook.ts` sends a correctly signed test webhook.

**Hosted Studio (optional).** `/studio` is embedded in every site. If you prefer `<name>.sanity.studio`, set `SANITY_STUDIO_PROJECT_ID` and run `npm run studio:deploy`.

---

## Not included (yet)

Multiple languages, comments, newsletters/forms, user accounts, a table block in article bodies, payments for digital products (offers link out to the seller), A/B tests. Add them in this repo once and every site gets them.
