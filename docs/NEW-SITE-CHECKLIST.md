# New site checklist

Do these in order. A site takes roughly 30–45 minutes the first few times, then less.
Replace `cozy-desk` / `cozydesk.com` with your own names.

---

## 1 · Sanity project (≈ 5 min)

1. Go to <https://www.sanity.io/manage> → **Create project** → pick the **Free** plan → dataset name `production`, dataset visibility **Public** (the site only reads published content).
2. Copy the **Project ID**.
3. **API → CORS origins:** add `https://cozydesk.com` and `http://localhost:3000` with *Allow credentials* ON. (Needed so `/studio` can sign in on your domain.)
4. **API → Webhooks → Create webhook** (after the first deploy you will know the URL, but you can create it now):

   | Field | Value |
   | --- | --- |
   | Name | `Revalidate site` |
   | URL | `https://cozydesk.com/api/revalidate` |
   | Dataset | `production` |
   | Trigger on | Create, Update, Delete |
   | Filter | `_type in ["post","category","author","offer","affiliateLink","staticPage","siteSettings"]` |
   | Projection | `{ _type, _id, "slug": slug.current, "categoryId": category._ref, "prevSlug": before().slug.current, "prevCategoryId": before().category._ref }` |
   | HTTP method | POST |
   | Drafts | **off** |
   | Secret | a long random string — keep it, you need it in step 2 |

   If Sanity rejects the projection because of `before()`, delete the last two fields; everything still works (an edited slug or moved article then refreshes its old page only after the next webhook for that page).
5. *(Only if you will use `bulk-import` or `seed`)* **API → Tokens → Add API token →** role **Editor**. Put it in your local `.env.local` as `SANITY_WRITE_TOKEN`. Never add it to Cloudflare.

## 2 · Cloudflare Worker (≈ 10 min)

Use **Workers Paid ($5/month, one plan for all your sites)** for any site you want to rely on.

1. Dashboard → **Workers & Pages → Create → Import a repository** → choose this GitHub repo.
2. **Name:** the Worker name must equal `CF_WORKER_NAME` below (lowercase, hyphens), e.g. `cozy-desk`.
3. **Build command:** `npm run cf:build`  **Deploy command:** `npm run cf:ship`
4. **Build variables** (Settings → Build → Variables and secrets):

   | Variable | Example | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://cozydesk.com` | final address, no trailing slash |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | `abc12xyz` | from step 1 |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` | |
   | `CF_WORKER_NAME` | `cozy-desk` | same as the Worker name |
   | `CF_ROUTE` | `cozydesk.com` | optional; adds apex + `www` custom domains if the domain is on Cloudflare |
   | `CF_CACHE` | `kv` | optional; `r2` (default) caches pages in R2 and needs R2 switched on for the account (payment method on file, free tier included). `kv` uses Workers KV instead: no billing step, but small free limits, so use it for test sites only |

5. **Worker secret** (Settings → Variables and secrets, the *runtime* list at the top, not the Build one): **Add variable** → Type **Secret** → `SANITY_WEBHOOK_SECRET` = the string from step 1.4 → Deploy. The deploy command uses `--keep-vars`, so later rebuilds keep it. Check: `POST /api/revalidate` without a signature should answer `401 Invalid signature` (a `500 … not set` means the secret is missing).
6. Deploy. The first run creates the cache store `cozy-desk-cache` automatically (an R2 bucket, or a KV namespace when `CF_CACHE=kv`). If it reports that it could not, create one with exactly that name in **R2** (or **Workers KV**) and redeploy. R2 must first be enabled for the account (R2 → Add R2 subscription; Cloudflare asks for a payment method).
7. Open the `*.workers.dev` address: you should see the setup/empty site. Open `/studio`, sign in.

> `NEXT_PUBLIC_*` values are written into the build. Changing one means redeploying.

## 3 · Site Settings (≈ 15 min)

Studio → **Site Settings**. Nothing here needs code.

- [ ] **Identity:** site name, tagline, **country** (en-US / en-GB / en-CA / en-AU: sets spelling, dates, currency, Amazon store and legal wording), logo, contact email
- [ ] **Modules:** Blog / Affiliate / Offers — switch on only what this site uses
- [ ] **Theme:** preset or your own primary + accent colours, heading + body fonts, corner style
- [ ] **Header menu & Footer** (optional — by default the menu lists every category and the footer shows Categories, Quick Links and Contact). Add a “Contact” link, reorder entries, or build your own footer columns; add social profile links
- [ ] **Home page:** already pre-filled (Hero → Trending → Recently published → Featured). Set the hero image and text; leave Trending empty until Search Console shows what performs (use the slug search); choose how many recent articles (6/9/12/15); turn Featured on once you have money articles
- [ ] **Ads & affiliate:** AdSense publisher ID (`ca-pub-…`) and slot IDs; Amazon tracking ID; disclosure wording
- [ ] **Analytics:** GA4 ID, Clarity ID, Search Console + Bing verification codes
- [ ] **SEO:** title template, default description, default share image

Then create **Authors**, **Categories**, edit the **Pages** (About, Contact, Privacy, Terms, Disclosure — read them!), and add articles.

## 4 · Content

- Write in Studio, or run `npm run bulk-import -- ./articles --upload-images --draft` (see README).
- Cover images: upload in Studio (best — resized on the fly) or paste a URL.
- Every article needs a category and an author.

## 5 · Domain

- If `CF_ROUTE` is set and the domain is on Cloudflare, the custom domains are created on deploy. Otherwise: Worker → Settings → **Domains & Routes → Add → Custom domain**.
- Update the Sanity CORS origin and the webhook URL if the address changed.
- Do **not** add a “Cache Everything” page rule.

## 6 · Pre-launch checks

- [ ] Publish an edit in Studio → the live page changes within a few seconds (webhook works). If not: Sanity webhook **Attempts** log, and `SANITY_WEBHOOK_SECRET` must match exactly.
- [ ] `/robots.txt` allows crawling and lists the sitemap; `/sitemap.xml` lists your pages; `/ads.txt` appears as soon as a Publisher ID is saved.
- [ ] View an article’s source: one `<h1>`, canonical URL, JSON-LD present.
- [ ] Affiliate links open (and `/go/<slug>` redirects).
- [ ] Privacy, Terms and Disclosure pages reviewed and edited for your real setup.
- [ ] Run PageSpeed Insights on the home page and an article (mobile). Target: performance 90+, layout shift ≈ 0.

## 7 · Launch day

The site is open to Google from its first deploy, so launch is just the accounts and checks below.

1. **Search Console:** add the property (use the verification code field), submit `https://cozydesk.com/sitemap.xml`.
2. **AdSense:** add the site, wait for review. `ads.txt` is already served from your Publisher ID.
3. **Consent (UK/EEA traffic):** AdSense → Privacy & messaging → create the GDPR message for the site and publish it. Keep *Google CMP* selected in Site Settings → Ads.
4. **Amazon Associates / other programs:** add the site URL, paste your tracking ID in Site Settings, and use each program’s required disclosure wording.

## 8 · Changing the code later

Push to the repo’s main branch → every Cloudflare Worker connected to it rebuilds (about 2–3 minutes each). Test risky changes locally with `npm run cf:preview` first. Content changes never need a deploy.
