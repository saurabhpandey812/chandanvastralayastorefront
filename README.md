# Chandan Vastralaya — user-facing storefront

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand. This is the
`apps/web` piece of the larger monorepo — it currently runs on mock data
(`src/lib/data/products.ts`) since the NestJS API is a separate build step.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's built

- **Homepage** (`/`) — editorial hero, category tiles, featured products
- **Listing page** (`/products/[category]`) — `men`, `women`, `kids`, or `all`,
  with subcategory filters and sorting (client-side, on mock data)
- **Product detail** (`/products/item/[slug]`) — size selection, add to bag
- **Cart** (`/cart`) — quantity controls, remove item, order summary

Cart state lives in `src/store/cartStore.ts` (Zustand, in-memory — resets on
refresh since there's no backend/persistence wired up yet).

## Swapping mock data for the real API

Every place that imports from `src/lib/data/products.ts` is the seam to
replace once `apps/api` exists — swap those calls for `fetch`/React Query
calls to the NestJS endpoints (e.g. `GET /products?category=women`) and the
UI itself shouldn't need to change.

## Design tokens

Defined in `tailwind.config.ts`: `paper`, `ink`, `ink-soft`, `muted`, `line`,
`accent`, `forest`. Display type is Fraunces (serif, headlines only), body/UI
type is Inter.
