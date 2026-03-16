# SEO & GEO Implementation Tracker

Last updated: 2026-03-15

## Legend
- ✅ Done
- 🔄 In progress
- ⏳ Next up
- 📋 Planned
- 🔗 Off-site (requires external action)

---

## Technical SEO

| Status | Task | Notes |
|--------|------|-------|
| ✅ | `robots.txt` | Located at `frontend/public/robots.txt`. Allows all crawlers including GPTBot, ClaudeBot, PerplexityBot |
| ✅ | `sitemap.xml` | Located at `frontend/public/sitemap.xml`. Static — see Dynamic Sitemap below |
| ✅ | `llms.txt` | Located at `frontend/public/llms.txt`. AI crawler profile for GEO |
| ✅ | Unique title + meta description per page | Implemented via `SeoService` in all 6 page components |
| ✅ | Canonical URL tags | Set via `SeoService.setCanonical()` on every page |
| ✅ | `RealEstateAgent` JSON-LD | Homepage — includes areaServed, credentials, contact |
| ✅ | `LocalBusiness` JSON-LD | Homepage — includes geo coordinates, hours, address |
| ✅ | `FAQPage` JSON-LD | Sell page + Contact page |
| ✅ | `Residence` JSON-LD | Property detail page (per-listing schema) |
| ⏳ | Dynamic sitemap via API | Add `GET /api/sitemap.xml` route that pulls live listing IDs — update `sitemap.xml` to point to this once MLS is live |
| ⏳ | Angular prerendering | Enable in `angular.json` (`prerender: true`) — improves Googlebot crawl quality. Requires SSR config. |
| 📋 | Neighborhood landing pages | `/listings/omaha-ne`, `/listings/council-bluffs-ia`, etc. — high-value for local SEO |
| 📋 | Blog / market updates | `/blog` — "2025 Omaha Housing Market", "Buying in NE vs IA", etc. |
| 📋 | Open Graph / Twitter Card meta tags | Add `og:image`, `og:title`, `og:description` to SeoService for social sharing |
| 📋 | Image optimization | Convert property images to WebP, add `width`/`height` attrs, lazy load — Core Web Vitals |

---

## Domain & Hosting

| Status | Task | Notes |
|--------|------|-------|
| ⏳ | Register `krierrealty.com` | Recommended registrar: Cloudflare (at-cost pricing, best DNS) |
| ⏳ | Assign `krierrealty.com` to Vercel frontend project | Add in Vercel dashboard → Project → Domains |
| ⏳ | Assign `api.krierrealty.com` to Vercel API project | Add in Vercel dashboard → API Project → Domains |
| ⏳ | Update `ALLOWED_ORIGINS` in Vercel API env vars | Add `https://krierrealty.com` once domain is live |
| ⏳ | Update `apiBaseUrl` in `frontend/src/environments/environment.ts` | Change to `https://api.krierrealty.com` |

---

## Email (Resend)

| Status | Task | Notes |
|--------|------|-------|
| ✅ | Resend SDK integrated | `api/src/services/email.service.ts` |
| ✅ | HTML email template | Branded navy/amber template with lead details |
| ✅ | Rate limiting on leads | Per IP (10/hr) + per email/phone (3/hr) |
| ✅ | Input sanitization | HTML stripping, injection pattern detection |
| ⏳ | Verify `krierrealty.com` on Resend | resend.com/domains → Add Domain → add SPF, DKIM, DMARC DNS records |
| ⏳ | Set `FROM_EMAIL=leads@krierrealty.com` in Vercel env | After domain verification |
| ⏳ | Set `LEAD_NOTIFY_EMAIL=aaron@krierrealty.com` in Vercel env | Aaron's notification address |

---

## Off-Site SEO (Manual Actions Required)

| Status | Task | Notes |
|--------|------|-------|
| 🔗 | Google Search Console | Go to search.google.com/search-console → Add property → Verify via DNS TXT record → Submit sitemap URL |
| 🔗 | Bing Webmaster Tools | Go to bing.com/webmasters → Add site → Submit sitemap → ChatGPT Browse uses Bing's index |
| 🔗 | Google Business Profile | business.google.com → Create profile for "Krier Realty" → Add address, phone, hours, photos — critical for local SEO |
| 🔗 | Zillow agent profile | zillow.com/agent-profile — ensures AI models see consistent NAP data |
| 🔗 | Realtor.com agent profile | realtor.com/realestateagents — high-authority backlink |
| 🔗 | Homes.com profile | homes.com — additional citation |
| 🔗 | NAP consistency check | Ensure Name, Address, Phone is identical across all profiles: "Aaron Krier", "Carter Lake, IA", "(402) 555-0187" |

---

## AI / GEO (Generative Engine Optimization)

| Status | Task | Notes |
|--------|------|-------|
| ✅ | `llms.txt` | Discoverable at `krierrealty.com/llms.txt` |
| ✅ | AI crawlers allowed in `robots.txt` | GPTBot, ClaudeBot, PerplexityBot all explicitly allowed |
| ✅ | Structured schema markup | `RealEstateAgent` + `LocalBusiness` + `FAQPage` give AI models structured facts |
| 📋 | Perplexity Pages | Create a Perplexity Page for Aaron once site is live — early GEO signal |
| 🔗 | Bing index | Submit sitemap to Bing Webmaster Tools — feeds ChatGPT Browse and Perplexity |
| 📋 | Wikipedia / Wikidata | Not applicable yet — requires notability. Revisit after press/media coverage |

---

## MLS Integration (SEO Impact)

| Status | Task | Notes |
|--------|------|-------|
| ✅ | Mock data wired to backend | 14 properties served via `/api/listings` |
| ⏳ | GPRMLS live credentials | Contact support@gprmls.com — sign IDX data agreement |
| ⏳ | Dynamic sitemap | Once live listings are available, add `GET /api/sitemap.xml` and reference it from `robots.txt` |
| 📋 | Property JSON-LD with real MLS data | `Residence` schema on property pages — already implemented, needs real data |

---

## Quick Reference: Key File Locations

| File | Purpose |
|------|---------|
| `frontend/public/robots.txt` | Crawler access rules |
| `frontend/public/sitemap.xml` | Page index for Google + Bing |
| `frontend/public/llms.txt` | AI model profile (GEO) |
| `frontend/src/app/services/seo.service.ts` | Title, meta, canonical management |
| `frontend/src/app/pages/home/home.component.ts` | RealEstateAgent + LocalBusiness JSON-LD |
| `frontend/src/app/pages/property-detail/property-detail.component.ts` | Residence JSON-LD per listing |
| `frontend/src/app/pages/sell/sell.component.ts` | FAQPage JSON-LD |
| `frontend/src/app/pages/contact/contact.component.ts` | FAQPage JSON-LD |
| `api/src/services/email.service.ts` | Lead notification emails via Resend |
| `api/.env.example` | All required environment variables |

---

## Next Immediate Actions (Ordered by Impact)

1. **Register `krierrealty.com`** — Cloudflare Registrar recommended
2. **Set up Google Business Profile** — biggest single local SEO lever
3. **Submit sitemap to Google Search Console + Bing Webmaster Tools**
4. **Verify `krierrealty.com` on Resend** — unblocks production email delivery
5. **Deploy to Vercel** — assign custom domain to both projects
6. **Enable Angular prerendering** — improves crawl quality significantly
7. **Create Zillow + Realtor.com agent profiles** — authority backlinks + NAP citations
