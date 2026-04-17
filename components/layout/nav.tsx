"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

const links = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Members" },
  { href: "/events", label: "Events" },
  { href: "/referrals", label: "Referrals" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close mobile menu whenever the route changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold"
          aria-label="Proto Community Hub - home"
        >
          Proto Community Hub
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                )}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="ml-1 flex items-center gap-1 border-l border-zinc-200 pl-2 dark:border-zinc-800">
            <LatencyButton />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div
          id="mobile-nav-panel"
          className="md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div className="mx-auto max-w-6xl space-y-1 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 pt-2">
              <LatencyButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  // Resolve initial theme on mount (respects stored choice, falls back to system)
  React.useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("theme")
        : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore if localStorage is blocked
    }
  }

  if (!mounted) {
    // Avoid a hydration flash; render a neutral placeholder that matches size.
    return (
      <div
        className="h-9 w-9 rounded-xl"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

/**
 * Cycles network latency: 0ms (instant) -> 350ms (default) -> 1500ms (slow) -> 3000ms (very slow).
 * Lets interviewers actually see the skeletons, optimistic UI, and loading states
 * without opening dev tools.
 */
const LATENCY_STEPS = [0, 350, 1500, 3000] as const;

function LatencyButton() {
  const latencyMs = useUIStore((s) => s.latencyMs);
  const setLatencyMs = useUIStore((s) => s.setLatencyMs);

  function cycle() {
    const idx = LATENCY_STEPS.indexOf(
      latencyMs as (typeof LATENCY_STEPS)[number]
    );
    const next = idx === -1 ? 350 : LATENCY_STEPS[(idx + 1) % LATENCY_STEPS.length];
    setLatencyMs(next);
  }

  const label =
    latencyMs === 0
      ? "Instant"
      : latencyMs < 1000
        ? `${latencyMs}ms`
        : `${(latencyMs / 1000).toFixed(1)}s`;

  const title = `Network latency: ${label}. Click to cycle (instant → 350ms → 1.5s → 3s).`;

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      aria-label={`Network latency ${label}, click to change`}
      title={title}
    >
      <Gauge className="h-3.5 w-3.5" aria-hidden />
      <span className="tabular-nums">{label}</span>
    </button>
  );
}
