# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoorraadInzicht — inventory management dashboard for Den Engelsen Bedrijfswagens (commercial vehicle dealer, 6 branches in NL). Tracks interest costs (5.5% p.a.), market positioning vs AutoScout24/Gaspedaal/Marktplaats/TheParking.eu, and generates action items at 30/45/60/90-day thresholds. Includes AI chat assistant and rich reports page.

**Client:** [Den Engelsen Bedrijfswagens](https://www.denengelsen.eu/) — MAN and Volkswagen commercial vehicle dealer.
**Live demo:** den-engelsen.revido.app
**Purpose:** Sales prototype to demonstrate the product during the sales process.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

**Troubleshooting:** If the dashboard shows "Voertuigen laden..." indefinitely, run `rm -rf .next && npm run dev` to clear the build cache.

## Architecture

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Supabase · Tailwind CSS · shadcn/ui (Radix) · Recharts · Framer Motion · Sonner (toasts)

### Data layer (dual mode)

- `lib/data-supabase.ts` — checks `NEXT_PUBLIC_MODE`: if `"demo"`, returns mock data; otherwise queries Supabase. Entry points: `fetchVehicles()`, `computeKPIs()`. Contains 20 hardcoded vehicles with procedurally-generated market listings (4 platforms) and action items.
- `lib/supabase.ts` — Supabase client factory.
- `lib/reports-data.ts` — dummy historical data for reports page (6 months of trends, branch stats, aging distribution).

### Key business logic (`lib/utils.ts`)

- `calcInterestCost(price, days)` — `(price × 0.055 × days) / 365`
- `getStatus(days)` — green (<30d), amber (30–45d), red (>45d)
- `calcRecommendedPrice()` — progressive discounts at 30/45/90-day thresholds
- `getUrgencyScore()` — composite of interest cost and days weight

### AI Chat (`lib/ai-chat.ts` + `components/dashboard/AIChat.tsx`)

Pre-scripted conversational assistant with pattern-matching for 10 query types (critical vehicles, branch stats, price analysis, interest costs, actions, brand/type filtering, vehicle lookup, etc.). Supports NL + EN queries. Floating widget with quick-action chips.

### Internationalization (`lib/i18n.tsx`)

Full EN/NL support via React context. Default language: **Dutch (NL)**. `useLang()` hook exposes `t()` (translate), `fmt()` (EUR), `fmtKm()`, `fmtDays()`. Language preference stored in localStorage (`si-lang`).

### Main pages

- `/` → redirects to `/dashboard`
- `/dashboard` — split-panel layout: vehicle grid (left) + detail view or AI Insights (right). Supports grid/list toggle, pill-shaped filters, sorting, grouping. AI chat widget floating bottom-right.
- `/reports` — 6 Recharts visualizations: stock aging, interest cost trend, branch performance, vehicle turnover, market position donut, revenue & growth. Period selector (3M/6M/12M). CSV export.
- `/login` — demo login page with pre-filled credentials.
- `/settings` — profile, notifications, security, data source settings.

### API routes

- `GET /api/setup` — creates Supabase tables and seeds vehicles.
- `/api/images` — image proxy route for Supabase vehicle images.

### Dashboard components

- `KPIBar` — animated counter metrics bar: total vehicles, interest cost, action required, critical count, avg days, market delta. Numbers count up on load with ease-out cubic animation.
- `VehicleDetail` — three-tab detail view (Overview, Actions, Market Analysis) wrapped in a card. AI recommendation box, price advice, interest cost, action checklist with toast notifications, market comparison with platform logos.
- `AIChat` — floating conversational AI widget with quick-action chips and smart responses.
- `VehicleImage` — smart image component with brand logo overlay, fallback to placeholder icons.

### Types (`types/index.ts`)

Core interfaces: `Vehicle`, `ActionItem`, `MarketListing`, `KPISnapshot`, `FilterState`. Market sources: AutoScout24, Gaspedaal, Marktplaats, TheParking. Stock status: green/amber/red. Action types: price_reduction, photo_update, call_prospect, export_platform.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_MODE=demo          # "demo" = mock data, no Supabase needed
```

## Deployment

Railway with Nixpacks builder. Config in `railway.json`. Pushes to `main` trigger automatic deploys to den-engelsen.revido.app.

## Styling & Design System

**Brand alignment:** Matches [denengelsen.eu](https://www.denengelsen.eu/) design.

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#143954` | Nav, buttons, accents |
| CTA dark | `#1D2241` | Gradients, avatar |
| Accent red | `#ff253a` | Alerts, urgency, KPI highlights |
| Background | `#F6F7F2` (HSL 72 11% 96%) | Page background (warm off-white) |
| Body text | `#0D0D0D` | Near-black |
| Muted | `#5F666F` | Secondary text |

**Fonts:** Poppins (headings, 600-700) + Open Sans (body, 300-500) + DM Mono (numbers/prices).

**Component patterns:**
- Cards: `rounded-2xl shadow-sm` with edge-to-edge images, no bottom image rounding
- Filters: pill-shaped `rounded-full` selects, active state fills with brand color
- KPI bar: uppercase labels, animated counters, backdrop blur
- Detail panel: white card wrapper with close button, tabbed content

Tailwind with CSS variables for theming. shadcn/ui components in `components/ui/`. Path alias: `@/*` maps to repo root.

### Vehicle images

All vehicle images use `denengelsen.eu` domain URLs (hotlink-safe). The `denengelsentopused.eu` domain blocks external requests — do not use those URLs. The `VehicleImage` component handles fallbacks by vehicle name/brand matching.
