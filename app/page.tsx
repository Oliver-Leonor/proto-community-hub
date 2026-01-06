import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">OTA Community Hub (Mini)</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Interview demo: Members directory, then Events + Referrals.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          href="/members"
        >
          Go to Members
        </Link>
        <Link
          className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          href="/events"
        >
          Go to Events
        </Link>
        <Link
          className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          href="/referrals"
        >
          Go to Referrals
        </Link>
      </div>
    </div>
  );
}
