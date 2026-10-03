# AI AGENCY XYZ Project Guide

## Overview

AI AGENCY XYZ is a responsive SaaS marketing site and client dashboard for an AI answering-agent business. The public experience explains the four service levels, human-review model, consulting offer, and merchandise catalog. The dashboard presents call performance and conversation outcomes in a layout designed for future Retell AI and business-phone data.

## Technology

- TanStack Start with React 19 and file-based TanStack Router routes
- Tailwind CSS 4 plus a custom global design system in `src/styles.css`
- Netlify deployment through `@netlify/vite-plugin-tanstack-start`
- Netlify Database with Drizzle ORM for operational call data
- Lucide React for interface icons

## Key Directories

- `src/routes/` — public pages and the client dashboard
- `src/components/` — shared site header, footer, and Turnstile widget
- `src/server/` — server-only helpers (Retell, rate limits); never import from client components
- `src/server/*.functions.ts` — TanStack server functions (RPC) callable from routes; every admin function checks the admin cookie
- `src/lib/agent-settings.ts` — the customer agent settings model, shared by the admin form and the future `/setup` wizard
- `docs/build-plan.md` — current phase plan and decisions
- `src/styles.css` — all design tokens, layout rules, animation, and responsive behavior
- `db/schema.ts` — source of truth for the Postgres schema
- `db/index.ts` — Netlify Database Drizzle client
- `netlify/database/migrations/` — generated database migrations applied by Netlify
- `public/` — static assets

## Routes

- `/` — homepage (2026 redesign): three-object triptych, Why XYZ axis, About, CTA
- `/agents` — AI Answering Agents page (redesign) including the live "Talk to it" demo (`src/components/DemoCall.tsx`); `/agent` redirects to `/agents#demo`
- `/strategy`, `/websites`, `/about`, `/book`, `/privacy`, `/terms` — honest "coming soon" stubs (`src/components/StubPage.tsx`); `/book?plan=` prefills the plan
- `/pricing` — four plan levels and startup-fee guidance
- `/products` — Printify-ready product catalog presentation
- `/consulting` — implementation and consulting services
- `/faq` — interactive service FAQ
- `/dashboard` — responsive call analytics demo workspace
- `/api/demo/web-call` — server route that verifies Turnstile, rate-limits, and creates the Retell web call
- `/api/retell/webhook` — Retell call events (signature-verified), routed by agent_id: demo calls email the owner; customer calls are stored in `call_records` and emailed to the customer
- `/admin` — owner-only admin (password in `ADMIN_PASSWORD`): create customers, which provisions a Retell LLM + agent + phone number; edit settings with version history and restore; pause and resume; recent calls

## Conventions

- Use PascalCase for React components and camelCase for local values.
- Keep route files focused on one page; extract elements shared across pages into `src/components/`.
- **New design system** (`src/xyz.css`): brand tokens `--x-*` (orange #EA622C, tangerine #F28C38 for orange text on gray, gray #4C5458, gray-light #F4F4F4, teal #003434, gold #F4B448, ice #D6EEF5, midnight #080C1C, white). Don't add other colors. Fraunces (display, SOFT 100, WONK 1, weight 900, highlighted words are synthesized-italic) + Work Sans. No text under 16px; 44px minimum touch targets. All design classes (`.pill`, `.puff`, `.quilt`, `.chip-btn`, …) are scoped under `.xyz`; shared header/footer in `src/components/XyzChrome.tsx`; brand images in `public/brand/`.
- Older pages (pricing, products, consulting, faq, dashboard, admin) still use the legacy `styles.css` look until redesigned.
- Use `.js` extensions for relative TypeScript imports used by server-side database code.
- Define every persistent schema change in `db/schema.ts`, then generate a named Drizzle migration.
- Never store Retell, Printify, telephony, or client credentials in source control.

## Data Model

The database includes organizations, assistants, call records, and integrations. `call_records.metadata` and `integrations.settings` provide flexible fields for normalized provider-specific data while stable reporting fields remain queryable columns.

The dashboard currently labels its presentation data as a demo workspace. Live ingestion should be implemented behind authenticated Netlify server code before replacing the sample records. Tenant isolation must always be enforced by organization ID on the server, never trusted from browser input alone.

## Non-Obvious Decisions

- Agent settings are append-only versions (`agent_settings_versions`); the highest version is live. Restoring appends a copy. Retell is updated before the version row is written, so history only holds settings that went live.
- Provisioning rolls back Retell resources (LLM, agent, number) on any failure so nothing bills without a customer.
- Phone numbers bind to `agent_version: 'latest'` so settings edits reach live callers immediately.
- The recording disclosure is always injected into the greeting (`buildBeginMessage`) and can't be removed.

- Human review is represented explicitly on Levels 2–4 because it is central to the offer.
- Startup fees are separate from subscriptions because discovery and integration complexity vary significantly.
- Product visuals are branded placeholders until the owner's final Printify designs and product links are supplied.
- No live Retell or Printify requests are made from the browser; future integrations belong in protected server-side routes or Netlify Functions.
