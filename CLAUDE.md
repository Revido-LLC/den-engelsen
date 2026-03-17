# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoorraadInzicht — inventory management dashboard for Den Engelsen Bedrijfswagens (commercial vehicle dealer, 6 branches). Tracks interest costs (5.5% p.a.), market positioning vs AutoScout24/Gaspedaal/Marktplaats, and generates action items at 30/45/60/90-day thresholds.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

## Architecture

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Supabase · Tailwind CSS · shadcn/ui (Radix)

### Data layer (dual mode)

- `lib/data-supabase.ts` — checks `NEXT_PUBLIC_MODE`: if `"demo"`, returns mock data from `lib/data.ts`; otherwise queries Supabase. Entry points: `fetchVehicles()`, `computeKPIs()`.
- `lib/data.ts` — 20 hardcoded vehicles with procedurally-generated market listings and action items. Used for demo/development without Supabase.
- `lib/supabase.ts` — Supabase client factory using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Key business logic (`lib/utils.ts`)

- `calcInterestCost(price, days)` — `(price × 0.055 × days) / 365`
- `getStatus(days)` — green (<30d), amber (30–45d), red (>45d)
- `calcRecommendedPrice()` — progressive discounts at 30/45/90-day thresholds
- `getUrgencyScore()` — composite of interest cost and days weight

### Internationalization (`lib/i18n.tsx`)

Full EN/NL support via React context. `useLang()` hook exposes `t()` (translate), `fmt()` (EUR), `fmtKm()`, `fmtDays()`. Language preference stored in localStorage.

### Main pages

- `/` → redirects to `/dashboard`
- `/dashboard` — split-panel layout: vehicle list/grid (left) + detail view (right). Supports grid/list toggle, grouping (branch/brand/status), sorting (days/price/mileage), filtering, and mobile responsive slide-in panels.
- `/login`, `/reports`, `/settings` — secondary pages

### API routes

- `GET /api/setup` — creates Supabase tables and seeds 24 vehicles. Used for initial database setup.
- `/api/images` — image proxy route

### Dashboard components

- `KPIBar` — horizontal metrics: total vehicles, interest cost, action required, critical count, avg days, market delta
- `VehicleDetail` — three-tab detail view (Overview, Actions, Market Analysis) with AI recommendation box and progress indicators
- `VehicleCard` — card/grid item for vehicle list

### Types (`types/index.ts`)

Core interfaces: `Vehicle`, `ActionItem`, `MarketListing`, `KPISnapshot`, `FilterState`. Stock status enum: green/amber/red. Action types: price_reduction, photo_update, call_prospect, export_platform.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_MODE=demo          # "demo" = mock data, no Supabase needed
```

## Deployment

Railway with Nixpacks builder. Config in `railway.json`. Pushes to `main` trigger automatic deploys.

## Styling

Brand color: `#15264C` (dark blue). Tailwind with CSS variables for theming. shadcn/ui components in `components/ui/`. Path alias: `@/*` maps to repo root.
