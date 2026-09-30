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
- `src/styles.css` — all design tokens, layout rules, animation, and responsive behavior
- `db/schema.ts` — source of truth for the Postgres schema
- `db/index.ts` — Netlify Database Drizzle client
- `netlify/database/migrations/` — generated database migrations applied by Netlify
- `public/` — static assets

## Routes

- `/` — primary marketing page
- `/pricing` — four plan levels and startup-fee guidance
- `/products` — Printify-ready product catalog presentation
- `/consulting` — implementation and consulting services
- `/faq` — interactive service FAQ
- `/dashboard` — responsive call analytics demo workspace
- `/agent` — "Talk to it" browser demo against the master Retell demo agent (see `docs/retell-demo-agent.md`)
- `/api/demo/web-call` — server route that verifies Turnstile, rate-limits, and creates the Retell web call
- `/api/retell/webhook` — Retell call events (signature-verified); emails demo call summaries and transcripts (Hostinger SMTP, or Resend)

## Conventions

- Use PascalCase for React components and camelCase for local values.
- Keep route files focused on one page; extract elements shared across pages into `src/components/`.
- Reuse CSS variables from `:root` rather than introducing unrelated colors.
- Preserve the editorial orange, cream, and black visual language.
- Use `.js` extensions for relative TypeScript imports used by server-side database code.
- Define every persistent schema change in `db/schema.ts`, then generate a named Drizzle migration.
- Never store Retell, Printify, telephony, or client credentials in source control.

## Data Model

The database includes organizations, assistants, call records, and integrations. `call_records.metadata` and `integrations.settings` provide flexible fields for normalized provider-specific data while stable reporting fields remain queryable columns.

The dashboard currently labels its presentation data as a demo workspace. Live ingestion should be implemented behind authenticated Netlify server code before replacing the sample records. Tenant isolation must always be enforced by organization ID on the server, never trusted from browser input alone.

## Non-Obvious Decisions

- Human review is represented explicitly on Levels 2–4 because it is central to the offer.
- Startup fees are separate from subscriptions because discovery and integration complexity vary significantly.
- Product visuals are branded placeholders until the owner's final Printify designs and product links are supplied.
- No live Retell or Printify requests are made from the browser; future integrations belong in protected server-side routes or Netlify Functions.
