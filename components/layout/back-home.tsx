"use client";

import Link from "next/link";

export function BackHome() {
  return (
    <div className="mb-4">
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-100 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        ← Home
      </Link>
    </div>
  );
}
