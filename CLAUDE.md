# CLAUDE.md

This file provides guidance for evolving this workspace into a single-agent, SEO-first real estate website. The goal: a production-ready frontend (Angular) that showcases a particular agent, lists and sells homes, captures leads, plugs into (mocked) MLS sources, and includes an AI chat assistant for search help.

## Quick commands

```bash
npm start          # Dev server at http://localhost:4200 (auto-reloads)
npm run build      # Production build -> dist/real-estate/
npm run watch      # Watch mode build with source maps
npm test           # Run Karma/Jasmine unit tests
```

## High-level architecture

- **Frontend**: Angular 19 (standalone components). Client-rendered with SSR/Prerendering considered for SEO.
- **Data**: Mock data in `PropertyService` for dev; replaceable adapters for MLS integrations and a lightweight serverless API for lead capture.
- **AI assistant**: Chat UI component connected to a mock AI service + hooks to filter listings.
- **Lead capture**: Fast, prominent buyer/seller forms that POST to a mock API endpoint (serverless or Netlify Functions) and to third-party CRMs via webhook integrations.

## Key pages & routes

- Home (`/`) — Agent hero (photo, bio, CTA), featured/current listings carousel, quick search, latest sold highlights, client testimonials, SEO-friendly agent overview content.
- Listings (`/listings`) — Filterable/searchable property grid (MLS-mock + local listings). Strong faceted filters, saved-search CTA.
- Property Detail (`/property/:id`) — Large images, features, map, agent contact widget, structured data (JSON-LD) for SEO, GA events, share links.
- Sold (`/sold`) — Distinct page showing closed/sold properties with sale price and story snippets.
- List Home / Seller (`/sell`) — Seller lead-capture form + seller resources and valuation request.
- Buyer Lead (`/buy`) or Contact (`/contact`) — Buyer lead form, schedule tour CTA, mortgage calculator.
- AI Assistant (`/chat` or modal) — Chat interface to help find homes and capture interest.

## Data & mock integrations

- Keep `PropertyService` as the single source of mock data for now. Design it with an adapter pattern so it can switch between `MockAdapter`, `MlsAdapter`, and `CachedAdapter`.
- Mock MLS integration: implement `MlsAdapter` that returns listings from annotated mock endpoints (simulate API keys, rate limits, pagination). Document endpoints used in dev.
- Example files to update/implement:
	- `src/app/services/property.service.ts` — central service exposing Observables.
	- `src/app/services/mls-adapter.ts` — mock MLS adapter; fetches JSON fixtures in `src/mocks/mls/`.
	- `src/mocks/mls/*.json` — mock MLS responses for testing.

## AI Chat Assistant (mocked)

- Provide a lightweight chat UI component `AiAssistantComponent` that can:
	- Accept natural-language queries (e.g., "3 beds under $450k near 68th St")
	- Call a `ChatService` with a mock LLM backend (`src/app/services/mock-chat.service.ts`) that returns suggested filters and listing IDs.
	- Offer quick-action buttons: "Save search", "Schedule tour", "Contact agent" which prefill lead forms.
- Build the backend adapter so the same UI can later call a real LLM API and/or the agent's knowledge base.

## Lead capture & conversion

- Primary aim: very low friction forms with one-click contact options (call, SMS, email) and progressive capture (start with phone or email, request more details on next step).
- Key lead flows:
	- Instant Contact Widget on property pages (name, phone, email, message, property id).
	- Quick buyer interest modal from search results (email/phone + preferred times).
	- Seller valuation form with property address + details and a callback scheduling widget.
- Integrations: mock webhook endpoints for CRM (HubSpot, Salesforce), and email (SendGrid). Document payloads and response handling in `CLAUDE.md` for implementers.

## SEO & Technical SEO (prioritized)

- Use component-level meta tag updates and prerendering for core pages (Home, Listings, Property Detail, Sold). Consider Angular Universal or Scully for prerender.
- Required SEO elements:
	- Unique title + meta description per page, with agent name and local keywords (e.g., "[Agent Name] - Omaha Homes for Sale").
	- Clean, crawlable URLs and server-side or prerendered content for property pages.
	- JSON-LD structured data for `RealEstateAgent` and `Residence` on property pages.
	- Sitemap generation script (static sitemap.xml) and robots.txt.
	- Open Graph / Twitter Card tags for social sharing on property pages.
	- Fast Core Web Vitals: lazy-load images, compress assets, use modern image formats and responsive images.

### Example JSON-LD snippets

- Include `RealEstateAgent` on agent/home pages and `Residence` or `Product` schema on property pages. Save examples under `src/mocks/schema/`.

## Accessibility & performance

- Ensure keyboard/navigable forms, ARIA labels for the chat widget and property carousel, and color contrast for CTAs.
- Use server-side or prerendered snapshots for content-heavy pages to improve load time and SEO.

## Analytics & tracking

- Track lead events and chat conversions with Google Analytics (GA4) + server-side webhooks for lead storage.
- Send micro-conversion events: `view_property`, `contact_initiated`, `chat_started`, `lead_submitted`.

## Developer guidance & file map

- `src/app/models/property.model.ts` — `Property`, `ListingSource`, `AgentProfile`, `Lead` interfaces.
- `src/app/services/property.service.ts` — exposes `getListings(filters)`, `getListingById(id)`, `getSold()`, and `syncWithAdapter()` methods.
- `src/app/services/mls-adapter.ts` — mock adapter with `search`, `getById`, `getSold` returning Promise/Observable.
- `src/app/services/mock-chat.service.ts` — interprets user messages and returns filter suggestions and listing refs.
- `src/app/components/ai-assistant/ai-assistant.component.ts` — chat UI and quick actions.

## Mock data & fixtures

- Store MLS-like mock files in `src/mocks/mls/` and sample schemas in `src/mocks/schema/`.
- Use a small set of realistic properties (photos, geocoordinates, price history, sold price) for the `sold` page and for testing AI flows.

## SEO checklist (developer friendly)

- Titles: Include agent name + local phrase for Home, Listings, Sold pages.
- Meta descriptions: Actionable and include target keywords (e.g., "Homes for sale in Omaha by [Agent Name]").
- JSON-LD: `RealEstateAgent` on homepage; `Residence` on property pages.
- Sitemap & robots.txt: Ensure property pages are included and updated when listings change.
- Canonical tags: Avoid duplicate content for similar listing variants.
- Performance: Audit Lighthouse, aim for 90+ in Performance and Accessibility.

## Lead webhook payload examples (mock)

- Buyer lead POST /api/lead:

	{
		"type": "buyer",
		"name": "Jane Doe",
		"email": "jane@example.com",
		"phone": "+1-402-555-0123",
		"message": "Interested in 3-bed homes under $400k",
		"source": "homepage-search"
	}

- Seller lead POST /api/seller:

	{
		"type": "seller",
		"name": "John Seller",
		"address": "123 Main St, Omaha, NE",
		"phone": "+1-402-555-0456",
		"preferred_contact": "email"
	}

## Next steps (implementation priorities)

1. Wire up `PropertyService` with `MockAdapter` and place MLS fixtures under `src/mocks/mls/`.
2. Implement core pages: Home, Listings, Property Detail, Sold, Contact, Sell.
3. Add `AiAssistantComponent` with `mock-chat.service` and connect quick-action CTAs to lead forms.
4. Add SEO meta service and JSON-LD snippets for property pages.
5. Implement lead webhook endpoints (mock serverless functions) and configure analytics events.

## Notes for maintainers

- Keep the app's data layer adapter-focused so real MLS APIs and CRM webhooks can be added without UI refactors.
- Prioritize prerendering or SSR for property pages for SEO; if hosting on static hosts, use a pre-render pipeline.
- Mock everything initially (MLS, chat, webhooks); replace adapters with real integrations behind feature flags later.

If you'd like, I can (pick one):
- scaffold the `mls-adapter` and mock files, or
- implement `AiAssistantComponent` with the mock chat backend, or
- create JSON-LD examples and a sitemap generator script.

-- End of agent-focused CLAUDE.md
