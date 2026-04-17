import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center p-6">
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
        404 · Not found
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        This page isn&apos;t part of the hub.
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        The link might be outdated, or you typed a route that doesn&apos;t
        exist. Jump back home and try one of the three workflows instead.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back home
        </Link>
        <Link
          href="/members"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Browse members
        </Link>
      </div>
    </div>
  );
}
