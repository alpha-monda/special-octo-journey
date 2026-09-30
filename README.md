# AI AGENCY XYZ

A polished SaaS website and client dashboard for AI-powered answering agents. The experience presents four monthly service levels from $29 to $500, explains the included human-review layer, promotes implementation consulting, previews a Printify merchandise catalog, and demonstrates how customers can explore call intelligence.

## Stack

- TanStack Start and React 19
- TanStack Router
- Tailwind CSS 4 with custom responsive styling
- Netlify Database and Drizzle ORM
- Netlify deployment tooling
- Lucide React icons

## Local Development

Install dependencies and start the TanStack development server:

```bash
pnpm install
pnpm dev
```

For local Netlify platform emulation, run:

```bash
netlify dev --port 8889
```

## Main Pages

- `/` — product story, workflow, analytics preview, and plan overview
- `/pricing` — interactive monthly/annual pricing across all four levels
- `/products` — Printify-ready branded merchandise presentation
- `/consulting` — startup and implementation service details
- `/faq` — interactive service questions
- `/dashboard` — sample call analytics, outcomes, and recent conversations
- `/agent` — "Talk to it" live browser demo (setup: `docs/retell-demo-agent.md`)

## Database

The Netlify Database schema lives in `db/schema.ts` and models organizations, AI assistants, normalized call records, human-review status, and provider integrations. Migrations are generated into `netlify/database/migrations/` and applied automatically by Netlify.

When the schema changes, create a new migration:

```bash
pnpm exec drizzle-kit generate --name add_descriptive_change
```

## Integration Notes

The dashboard intentionally uses clearly labeled sample data until authentication and provider credentials are configured. Retell AI call ingestion, business-phone records, client-system connections, and automated data exports should be added in authenticated server-side handlers. The product page is ready for the owner's final Printify images, variants, and checkout URLs.
