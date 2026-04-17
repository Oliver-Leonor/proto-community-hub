# Proto Community Hub

A lightweight operating system for your community: members directory, event booking, and referral tracking in one focused Next.js app.

Proto Community Hub is a full-stack community platform that demonstrates production-grade front-end patterns: URL-synced filters, optimistic mutations with rollback, infinite loading, focus-trapped drawers, and clean state separation between server cache (React Query) and UI state (Zustand).

## Live Demo

<https://proto-community-hub.vercel.app>

## Features

- **Members directory** - Searchable member grid with tier filters and shareable URL state. Every filter combination is a link you can send a teammate. Infinite scroll with IntersectionObserver. Keyboard-accessible detail drawer with focus trap and focus return.
- **Event booking** - One-tap seat reservation with instant UI feedback. The optimistic update ships immediately; React Query handles rollback if the mutation fails.
- **Referral tracking** - Generate share links, track accepted invites, see the funnel in real time. Recent invite log with timestamps.
- **Global latency control** - Built-in button cycles network latency (instant / 350ms / 1.5s / 3s) so anyone can see the skeletons, optimism, and rollback states without opening dev tools.
- **Light and dark mode** - User-toggleable with `localStorage` persistence. Zero theme flash on first paint.
- **Zod-validated boundaries** - Every mock API response is parsed at runtime so the type system and the runtime never drift.

## Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Server + client components, streaming, first-class TypeScript |
| Language | TypeScript (strict) | Shared types across UI, store, validators, and mocks |
| Styling | Tailwind CSS v4 | Fast utility-first styling, no custom CSS drift |
| Server cache | TanStack React Query v5 | Retries, caching, optimistic mutations, automatic refetch |
| UI state | Zustand | Simple global UI state (drawer, latency) without Context boilerplate |
| Validation | Zod | Parse mock responses at runtime so bad data never leaks into the UI |
| Icons | lucide-react | Consistent icon set with tree-shakeable imports |
| Deployment | Vercel | Zero-config Next.js deploys, preview URLs per push |

## Architecture

```
URL params (source of truth for filters)
   ↓
useSearchParams  ↔  useState (seed once)  →  debounced value
                                              ↓
                                         React Query cache
                                              ↓
                                         Fetch + Zod parse
                                              ↓
                                         UI renders list + drawer
```

Three pages, three patterns:

- **Members** is the heavy page. URL-synced filters, debounced search, `useInfiniteQuery` with IntersectionObserver sentinel, Zustand-driven drawer that takes a focus trap and returns focus on close.
- **Events** demonstrates optimistic booking. `onMutate` snapshots previous cache, applies the optimistic update, then rolls back on error or reconciles on success.
- **Referrals** extends optimism to multi-field state. The invite count bumps immediately; the full invite log reconciles from the "server" response.

## Running Locally

```
git clone https://github.com/Oliver-Leonor/proto-community-hub.git
cd proto-community-hub
npm install
npm run dev
```

Open <http://localhost:3000>.

## Debug Workflow

These aren't hidden - they're meant to be triggered:

- **Latency control** (nav bar) - click the gauge button to cycle between instant, 350ms, 1.5s, and 3s of fake network delay. All mock fetches and mutations read from this value, so you can demo loading states and optimistic UI at any speed.
- **`/events?debug=1`** - shows a reset button for the events mock DB. `Ctrl+Shift+R` is bound to it. Useful after you've booked every seat and want to start fresh.
- **`/referrals?debug=1`** - unlocks the "Simulate invite" button so you can watch the invite log grow and the optimistic counter reconcile.

## Key Architecture Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed rationale on every technical choice - what I chose, why, what I considered instead, and the limitations I'm accepting.

## Project Structure

```
app/
  layout.tsx              Root layout, metadata, theme-flash prevention
  page.tsx                Home - product framing with 3 feature CTAs
  not-found.tsx           Custom 404
  members/                Members page + client component
  events/                 Events page + client component
  referrals/              Referrals page + client component
components/
  ui/                     Button, Card, Badge, Input, Skeleton
  layout/                 Nav (sticky, mobile drawer, theme toggle, latency)
  members/                MemberCard, MemberFilters, MemberDrawer
  events/                 EventCard, BookSeatButton
  referrals/              ReferralCard (with invite log)
lib/
  utils.ts                cn, formatDate, formatTime, simulatedLatency
  validators.ts           Zod schemas for every domain type
  query-client.tsx        React Query provider
store/
  ui-store.ts             Zustand: drawer state + global latency
mock/
  members.ts              Member seed data
  events.ts               Event seed data
  events-db.ts            In-memory mock DB with mutations
  referrals.ts            Referral seed with invite log
  referrals-db.ts         In-memory mock DB with invite simulation
types/
  domain.ts               Shared domain types
public/
  og.png                  Open Graph social preview
```

## Author

**Oliver Leonor** - Full-Stack Developer & AI Engineer

- Portfolio: [oliver-leonor.vercel.app](https://oliver-leonor.vercel.app)
- GitHub: [github.com/Oliver-Leonor](https://github.com/Oliver-Leonor)
- LinkedIn: [linkedin.com/in/oliver-leonor-582706228](https://linkedin.com/in/oliver-leonor-582706228)
