<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# English Sites — rules for changing this repo

One repo serves every site; a site is a Cloudflare Worker + a Sanity project. Read `README.md` first.

1. **Never add per-site code.** Anything that differs between sites (name, country, colours, fonts, modules, IDs, menus, home layout) belongs in Sanity → Site Settings (`sanity/schemas/siteSettings.ts`, read through `lib/settings.ts`). Environment variables are only for deployment (`lib/config.ts`).
2. **Keep pages statically cached.** No `cookies()`, `headers()` or `searchParams` in pages or layouts. Pagination uses paths (`/blog/page/2`). Every Sanity read goes through `sanityFetch` with explicit cache tags; if you add a query, add its tags in `sanity/queries.ts` and expire them in `app/api/revalidate/route.ts`.
3. **Don't swallow Sanity errors.** A failed refresh must keep serving the last good page, not cache an empty one.
4. **Modules gate everything.** A switched-off module (`blog`, `affiliate`, `offers`) must 404 its routes, drop out of sitemaps, menus and home sections. New routes follow the same rule.
5. **Sanity Studio code uses relative imports** (no `@/` alias) in `sanity/**`, `sanity.config.ts` and the `lib/` files they import, so `sanity deploy` (Vite) still builds.
6. **Fonts and images:** fonts are self-hosted from `public/fonts` (see `lib/fonts.ts`); images go through `lib/image-loader.ts` (Sanity CDN). Don't add Google Fonts or a Next image optimizer.
7. **Affiliate output:** links use `resolveHref` (`lib/affiliates.ts`), `rel="noopener noreferrer nofollow sponsored"`, and the disclosure logic in `app/[slug]/page.tsx`.
8. **Accessibility and speed are part of done:** keep colour contrast ≥ 4.5:1 (`lib/theme.ts` picks text colours automatically), reserve space for ads, no layout shift.
9. **Before finishing:** `npm run lint`, `npm run typecheck`, `npm run build`, and for deployment-related changes `npm run cf:build`. `scripts/dev/mock-sanity.ts` lets you test against realistic content offline.
10. `wrangler.jsonc` is generated per site by `scripts/generate-wrangler.ts` and is git-ignored — change the generator, not the output.
