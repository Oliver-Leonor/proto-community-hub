# Architecture Decisions

This document explains the architectural decisions behind **Proto Community Hub**, a full-stack community platform I built to demonstrate production-grade front-end patterns. For each decision: **what I chose**, **why**, **what I considered instead**, and **the limitations I'm accepting**.

---

## Framework & Architecture

### I chose Next.js App Router over Pages Router

**What I chose.** Next.js 15 App Router, with server components by default and `"use client"` only where I need interactivity (every page has a `page.tsx` shell that renders a client component with the real logic).

**Why.** The `app/` directory's nested layouts and file-system conventions let me keep the nav, query provider, and metadata in one place that every route inherits for free. Server components by default means the home page ships zero React runtime for its static content - only the nav and interactive CTAs need client JS. Metadata is a first-class export (`export const metadata: Metadata`) which is nicer than stitching together `<Head>` children.

**What I considered.** Pages Router - more tutorials, bigger example ecosystem. Ruled out because (a) Pages is in maintenance mode, (b) I'd lose the server/client split that makes the home page and 404 genuinely free, and (c) `useSearchParams` in App Router has no Pages equivalent that's as ergonomic for the URL-synced filter pattern on Members.

**Limitations.** Server/client boundaries are a real learning curve. Every page that uses React Query, Zustand, or `useSearchParams` has to be a client component - so I split each route into `page.tsx` (server shell) + `*-client.tsx` (real logic). That's more files, but the separation is worth it.

### I chose a single app over separate member/event/referral services

**What I chose.** One Next.js app with all three workflows in one deploy. Shared domain types, shared Zod validators, shared UI primitives.

**Why.** At this scope a microservice split would cost more than it buys. One deploy, one type graph, one bundle. The three features are conceptually different but operationally identical (fetch, filter, mutate, cache). Splitting them would force me to invent inter-service types that currently flow through one `types/domain.ts` file.

**What I considered.** Separate Cloudflare Workers for each feature, or a Node service behind Next.js. Both work, both add coordination cost I don't need. Useful if this app ever grew auth, billing, or per-feature scale limits.

**Limitations.** All three features share a single bundle. If Events grew a heavy chart library it would load on Members too unless I carefully code-split.

---

## State Management

### I chose React Query + Zustand over Redux / Context

**What I chose.** React Query owns everything that came from a "server" (members list, events list, referral data). Zustand owns UI state that doesn't belong to any server (drawer open/closed, global latency setting). No Context, no Redux.

**Why.** This is the single most impactful choice in the codebase. The two state systems solve different problems: React Query handles caching, invalidation, retries, and optimistic updates for server-derived data. Zustand handles "is the drawer open" - a question the server will never care about. Mashing both into Context would force me to write manual cache-invalidation glue that React Query already does. Mashing both into Redux would drag in boilerplate that a three-feature app doesn't justify.

**What I considered.**

- **Redux Toolkit + RTK Query** - functionally similar but heavier. RTK Query is fine; the Redux patterns layered on top add ceremony that Zustand skips.
- **Context alone** - falls apart once I need cache invalidation, optimistic updates, or dedup. I'd end up rebuilding React Query badly.
- **Jotai** - similar ergonomics to Zustand but more opinionated about atoms. Zustand's single-store pattern fit better for the amount of global UI state I actually have (two fields).

**Limitations.** Two state libraries means new contributors have to know which data goes where. I mitigate this with the rule "if a server will ever return it, React Query owns it; otherwise Zustand."

### I chose Zustand's `getState()` for the global latency control

**What I chose.** The debug latency value lives in Zustand. Mock fetch functions read it via `useUIStore.getState().latencyMs` inside `simulatedLatency()`. The nav bar's LatencyButton reads and writes it via the standard hook.

**Why.** Fetch functions aren't components and can't call hooks. Threading the latency value through every `queryFn` as an argument would pollute the signatures and force every call site to know about debug state. `getState()` is the official escape hatch for exactly this case: read current store state from non-React code.

**What I considered.** Making the latency a module-level variable in `lib/utils.ts`. Would work, but then the LatencyButton would need a forceful re-render mechanism to reflect the change; Zustand gives me that for free.

**Limitations.** `getState()` reads are non-reactive - the fetch function sees the latency at call time, which is exactly what I want for simulating network delay, but would be wrong if I wanted the value to hot-swap mid-request.

---

## URL State for Filters

### I chose URL params as the source of truth for Members filters

**What I chose.** `?q=...&city=...&tier=...` on the Members page. Local state seeds from the URL once on mount, then writes back to the URL on change (debounced).

**Why.** Shareability is the feature. A team lead filtering members by `tier=citizen&city=cebu` can paste the URL in Slack and everyone lands on the same view. Refresh doesn't lose state. Back/forward buttons work. This is impossible without the URL as the source of truth.

The bidirectional sync is the tricky part: user input → URL → query key → refetch, and back/forward → URL → state → query key → refetch. I use a `didMountRef` to skip the initial write so we don't clobber the URL on first render, and a separate effect listens to `searchParams` changes to handle browser back/forward.

**What I considered.**

- **Filter state in React Query's query key alone** - loses shareability, breaks refresh.
- **Filter state in Zustand** - same problem. Zustand survives component unmount but not URL paste.
- **`nuqs` library** - solves this pattern well but adds a dependency for what's ultimately ~30 lines of code.

**Limitations.** The debounced write means there's a small window where local state and URL disagree. Fine because React Query keys from the *debounced* value, so refetches are cheap; the UX only shows a 250ms lag in the URL itself.

### I chose 250ms debounce for search / city, 150ms for tier

**What I chose.** Text inputs debounce at 250ms. Tier buttons debounce at 150ms.

**Why.** Text input needs enough delay to avoid firing a refetch on every keystroke. 250ms is the standard sweet spot - it's long enough that a fast typist finishes a word before the fetch fires, short enough that the app feels responsive. Tier is a button click, not a keystroke, so a longer debounce would just add perceived lag.

**Limitations.** The 250ms debounce is per-input; if a user types in Search and immediately clicks a tier, they'll see two refetches fire in quick succession. Fine for a demo; a debounced grouped effect would batch them for production.

---

## Optimistic Mutations

### I chose optimistic updates with cache snapshots over server-first mutations

**What I chose.** Every mutation uses the full `onMutate` → `onError` → `onSuccess` → `onSettled` pattern. `onMutate` cancels in-flight queries, snapshots the current cache, and applies the optimistic update. `onError` restores the snapshot. `onSuccess` writes the real server response over the optimistic data. `onSettled` invalidates the query to trigger a refetch and reconcile anything else that may have changed.

**Why.** Without optimism, booking a seat feels like: click → wait 350ms → see the count update. With optimism: click → see the count update → briefly wait for server confirmation. The perceived responsiveness is dramatically better, and the full pattern means I can handle server failures gracefully - the UI rolls back to the known-good snapshot rather than staying in a wrong state.

The rollback isn't theater. I tested it by forcing the mock DB to throw; the count correctly reverts to its previous value.

**What I considered.** Mutation without optimism (simpler, slower-feeling). Optimism without rollback (dangerous; UI stays wrong on error). Neither is a real option for a "senior front-end" demo because both miss the point of the pattern.

**Limitations.** The mock DB doesn't actually fail, so the error path is latent. In production I'd ensure mutations have a retry policy and the error-handling UX tells the user what happened rather than silently rolling back.

### I chose `invalidateQueries` in `onSettled` over trusting the optimistic write

**What I chose.** After every mutation, regardless of success or failure, I call `invalidateQueries` to refetch. The optimistic or server-response write is immediately replaced by a fresh server read.

**Why.** Optimistic writes can go stale in ways the mutation response doesn't capture. Example: in events, someone else could have booked a different seat while my mutation was in flight. My `setQueryData` only reflects *my* change; `invalidateQueries` makes sure I also see *their* change on the next frame.

**Limitations.** An extra refetch per mutation is the cost. For mock data it's free; in production against a real API this doubles the request count for write-heavy screens. For a mission-critical mutation I'd skip `invalidateQueries` and trust the server response alone.

---

## Data Validation

### I chose Zod parsing on every mock response

**What I chose.** Every fetch function calls `schema.parse(rawData)` before returning. If the mock data violates the schema, the fetch throws and React Query's error state surfaces it.

**Why.** The TypeScript type `Member[]` is a compile-time guarantee only. At runtime, I could change the mock file and introduce a typo that silently breaks the UI. Zod parses the value at the boundary, catches the drift, and turns it into a loud failure I can see.

More importantly: this is the same pattern I'd use against a real API. If I swap `membersMock` for a `fetch("/api/members")`, the Zod schema doesn't change. The validation layer stays intact and protects the UI from a misbehaving backend.

**What I considered.** Skipping runtime validation because "it's just mock data." Short-sighted: the whole point of the app is to show patterns that graduate to production.

**Limitations.** Zod parsing costs a few microseconds per call. For a large list (tens of thousands of items) I'd switch to a schema that samples rather than parses every entry. At this scale it's immeasurable.

---

## Drawer Accessibility

### I chose a focus trap with focus return over a plain modal

**What I chose.** The Members drawer traps Tab / Shift+Tab inside the panel while open, remembers which element the user came from, and returns focus there on close. Escape closes the drawer. `role="dialog"` and `aria-modal="true"` tell assistive tech it's a modal. `aria-labelledby` points at a visible title element.

**Why.** A modal that loses keyboard focus to the document body is a genuine accessibility failure, not a polish item. It also breaks screen reader navigation. A proper focus trap is ~40 lines of code and the difference between "works for everyone" and "works only for mouse users."

**What I considered.**

- **Radix Dialog / Base UI Dialog** - production-grade, handles all of this. Overkill for one drawer.
- **`focus-trap-react`** - small library that does exactly this. Would be my pick if the app had 3+ modals; for one, hand-rolling is cheaper.
- **No trap** - the most common mistake in custom modals. Ruled out as the point of writing the component myself.

**Limitations.** My focus trap doesn't handle every edge case (iframes inside the panel, dynamically added focusable elements). Fine here because the panel's content is static; a generic library would handle those.

---

## PDF Processing... wait, wrong project

(Kidding. There's no PDF processing here. But the next section is the equivalent complexity pick: what to do about mock data persistence.)

## Mock Data

### I chose in-memory mock DBs over JSON-Server or MSW

**What I chose.** `mock/events-db.ts` and `mock/referrals-db.ts` are plain TypeScript modules that hold mutable state in module-scoped variables. Functions like `bookSeatInDb` read and write that state directly.

**Why.** A mock DB that lives inside the app removes a whole category of dev-environment failures (port conflicts, missing env vars, stale state across terminal sessions). The mutations are genuinely mutable, so optimistic updates have something real to react to. A page refresh resets the state, which is the right behavior for a demo.

**What I considered.**

- **MSW (Mock Service Worker)** - industry standard for intercepting real `fetch` calls with mock handlers. Best pick if I wanted to test the actual request pipeline. Overkill because my "fetch functions" already accept the in-memory state directly.
- **JSON Server** - separate process, requires running alongside `next dev`. Adds friction.
- **localStorage-backed mock DB** - would persist across refreshes but introduces hydration concerns between SSR and the client.

**Limitations.** State resets on refresh. That's a feature for a demo, a bug for development against real workflows. For a real backend, the mock DB pattern graduates to a `fetch()` call against an API route that reads from a real database.

---

## UI & Styling

### I chose Tailwind CSS v4 over styled-components / CSS modules

**What I chose.** Tailwind v4 with zero custom component libraries beyond the thin `ui/` primitives (Button, Card, Badge, Input, Skeleton).

**Why.** Utility classes keep styling next to the markup, which means refactors are safer (delete the JSX, the styles go with it) and there's no orphaned CSS file bloating the bundle. Tailwind's design tokens (`zinc-*`, `rounded-xl`, `text-sm`) make the visual language consistent without a formal design system document.

v4 specifically: the new `@theme` directive in CSS means my token layer is declarative and the Tailwind build is measurably faster than v3.

**What I considered.** CSS modules (fine but isolated per-file; hard to maintain a design system across 20+ components). styled-components (runtime cost, breaks server components). Stitches (dormant).

**Limitations.** Utility-heavy JSX is dense. I use small helper components (`FeatureCard` on the home page) when the JSX starts to exceed ~5 classes per element.

### I chose a flash-free theme initialization script

**What I chose.** An inline `<script>` in `<head>` runs before the body paints. It reads the stored theme preference from `localStorage` (or falls back to `prefers-color-scheme`) and toggles the `dark` class on `<html>` synchronously.

**Why.** Without this, users who prefer dark mode see a flash of light content on first paint while React hydrates. That flash is jarring and looks cheap. The inline script is ~10 lines and eliminates it completely.

`suppressHydrationWarning` on `<html>` is required because the server renders without the class and the client sets it before hydration. React's warning is accurate but expected here.

**What I considered.** `next-themes` - a popular library that handles this. Adds a dependency for ~15 lines of code. Worth it at scale; over-engineered here.

**Limitations.** The inline script runs synchronously, which adds a trivial amount to TTFB. Unmeasurable in practice.

---

## Tradeoffs & Limitations

A consolidated list of things I know I'm accepting:

- **No real backend.** All data is in-memory. State resets on refresh. The patterns (React Query, Zod, optimistic mutations) are production-identical; the data layer isn't.
- **No auth.** Anyone with the URL sees everything. Fine for a demo; production would add Clerk / NextAuth and a `User` table.
- **No tests.** Verified manually end-to-end including the optimistic rollback path. For production I'd add Vitest for the mock DB logic and Playwright for the three critical user flows (filter → drawer, book seat, generate referral).
- **Mobile nav is a collapsible list, not a full drawer.** No animation, no overlay. Works fine at all sizes, but a polished version would use a slide-in panel with a backdrop.
- **Infinite scroll has no "load previous" affordance.** If a user scrolls far down and wants to jump back to the top, they have to scroll manually. A jump-to-top button would be a one-hour addition.
- **Error states are minimal.** Every page handles `isError` but the messages are generic. A production version would differentiate between network errors, validation errors, and 404-style "not found" states.
- **Latency control is global, not per-query.** Every mock query uses the same delay. Fine for demo; a real network simulator would vary latency per endpoint.
- **Drawer focus trap doesn't handle DOM mutations.** If I dynamically added focusable elements to the open drawer, the trap wouldn't refresh its list. The content is static, so this is latent.
- **Invite log is capped at 20 entries.** Simulated invites past that point silently drop from the log (the count keeps incrementing). Fine for demo; production would paginate.
