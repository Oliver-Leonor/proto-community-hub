import Link from "next/link";
import { ArrowRight, Users, CalendarDays, Gift } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="font-medium">Community platform</span>
            <span className="text-zinc-400">•</span>
            <span>Proto</span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            A lightweight operating system for your community.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
            Run a members directory, host events, and grow through referrals -
            without stitching together six separate tools. Three focused
            workflows that share one source of truth.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/members"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Browse members
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              See upcoming events
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon={<Users className="h-4 w-4" aria-hidden />}
          title="Members"
          blurb="Searchable directory with tier filters and shareable URLs. Every filter state is a link you can send a teammate."
          ctaHref="/members?tier=citizen&city=cebu"
          ctaLabel="Try a sample search"
        />
        <FeatureCard
          icon={<CalendarDays className="h-4 w-4" aria-hidden />}
          title="Events"
          blurb="Book a seat in one tap. The UI updates instantly, then reconciles with the server - with full rollback if the booking fails."
          ctaHref="/events"
          ctaLabel="Browse events"
        />
        <FeatureCard
          icon={<Gift className="h-4 w-4" aria-hidden />}
          title="Referrals"
          blurb="Generate a share link, track invites, and see the funnel in real time. Watch the invite log update as new members join."
          ctaHref="/referrals"
          ctaLabel="Open referrals"
        />
      </section>

      {/* Tech footnote - quiet, below the fold */}
      <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Under the hood
        </div>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Next.js App Router, TypeScript, Tailwind, React Query, Zustand, Zod.
          URL-synced filters. Optimistic mutations with rollback. Zero runtime
          errors from unvalidated data.
        </p>
        <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
          See{" "}
          <a
            href="https://github.com/Oliver-Leonor/proto-community-hub/blob/main/DECISIONS.md"
            className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            DECISIONS.md
          </a>{" "}
          for the full rationale on every technical choice.
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  blurb,
  ctaHref,
  ctaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {icon}
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>

      <div className="mt-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
        {blurb}
      </div>

      <div className="mt-4">
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80 dark:text-zinc-100"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
