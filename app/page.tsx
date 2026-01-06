import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="font-medium">Prototype</span>
            <span className="text-zinc-400">•</span>
            <span>Community Platform UI</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Proto Community Hub
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Mini project for the Senior Front End Engineer interview.
            Demonstrates URL-synced filters, infinite loading, optimistic
            updates, and clean state separation (React Query + Zustand).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/members"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Open Members
            </Link>

            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Open Events
            </Link>

            <Link
              href="/referrals"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Open Referrals
            </Link>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Members</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sticky filters + URL shareability + infinite loading + member
            drawer.
          </div>
          <div className="mt-4">
            <Link
              href="/members?tier=citizen&city=cebu"
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80 dark:text-zinc-100"
            >
              Try a sample search →
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Events</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Optimistic booking UI with rollback-ready mutation logic.
          </div>
          <div className="mt-4">
            <Link
              href="/events?debug=1"
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80 dark:text-zinc-100"
            >
              Debug mode (reset) →
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Referrals</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Shareable referral link + generate code + debug invite simulation.
          </div>
          <div className="mt-4">
            <Link
              href="/referrals?debug=1"
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80 dark:text-zinc-100"
            >
              Debug mode (simulate invites) →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-xs text-zinc-500 dark:text-zinc-500">
        Built with Next.js App Router + TypeScript + Tailwind + React Query +
        Zustand + Zod.
      </div>
    </div>
  );
}
