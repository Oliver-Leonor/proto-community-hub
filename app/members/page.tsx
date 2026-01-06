"use client";

import * as React from "react";
import { z } from "zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberCard } from "@/components/members/member-card";
import { MemberDrawer } from "@/components/members/member-drawer";
import { MemberFilters } from "@/components/members/member-filters";
import { BackHome } from "@/components/layout/back-home";

import type { Member, MemberTier } from "@/types/domain";
import { membersMock } from "@/mock/members";
import { sleep } from "@/lib/utils";
import { memberSchema } from "@/lib/validators";

const membersArraySchema = z.array(memberSchema);

const PAGE_SIZE = 9;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function normalizeTier(v: string | null): MemberTier | "all" {
  if (v === "citizen" || v === "resident" || v === "founder") return v;
  return "all";
}

function buildSearchParams(input: {
  q?: string;
  city?: string;
  tier?: MemberTier | "all";
}) {
  const sp = new URLSearchParams();

  const q = (input.q ?? "").trim();
  const city = (input.city ?? "").trim();
  const tier = input.tier ?? "all";

  if (q) sp.set("q", q);
  if (city) sp.set("city", city);
  if (tier !== "all") sp.set("tier", tier);

  const s = sp.toString();
  return s ? `?${s}` : "";
}

/**
 * Mock “server” paging:
 * - validate data with Zod
 * - filter in the queryFn (as if it were backend)
 * - slice by cursor
 */
async function fetchMembersPage(args: {
  cursor: number; // index offset
  q: string;
  city: string;
  tier: MemberTier | "all";
}): Promise<{ items: Member[]; nextCursor: number | null; total: number }> {
  await sleep(350);

  const all = membersArraySchema.parse(membersMock);

  const q = args.q.toLowerCase();
  const c = args.city.toLowerCase();

  const filtered = all.filter((m) => {
    const matchesTier = args.tier === "all" ? true : m.tier === args.tier;
    const matchesCity = c ? m.city.toLowerCase().includes(c) : true;
    const matchesQuery = q
      ? m.name.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q))
      : true;

    return matchesTier && matchesCity && matchesQuery;
  });

  const start = args.cursor;
  const end = start + PAGE_SIZE;
  const items = filtered.slice(start, end);
  const nextCursor = end < filtered.length ? end : null;

  return { items, nextCursor, total: filtered.length };
}

export default function MembersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Seed state from URL (once)
  const initial = React.useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      city: searchParams.get("city") ?? "",
      tier: normalizeTier(searchParams.get("tier")),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = React.useState(initial.q);
  const [city, setCity] = React.useState(initial.city);
  const [tier, setTier] = React.useState<MemberTier | "all">(initial.tier);

  // Debounce for URL + query key stability
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const debouncedCity = useDebouncedValue(city.trim(), 250);
  const debouncedTier = useDebouncedValue(tier, 150);

  // 2) URL write (debounced)
  const didMountRef = React.useRef(false);
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const next = buildSearchParams({
      q: debouncedQuery,
      city: debouncedCity,
      tier: debouncedTier,
    });

    const current =
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";
    if (current === next) return;

    router.replace(`${pathname}${next}`, { scroll: false });
  }, [
    debouncedQuery,
    debouncedCity,
    debouncedTier,
    pathname,
    router,
    searchParams,
  ]);

  // 3) Sync state on back/forward
  React.useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlCity = searchParams.get("city") ?? "";
    const urlTier = normalizeTier(searchParams.get("tier"));

    if (urlQ !== query) setQuery(urlQ);
    if (urlCity !== city) setCity(urlCity);
    if (urlTier !== tier) setTier(urlTier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 4) Infinite query keyed by filters (so changing filters resets paging)
  const membersQ = useInfiniteQuery({
    queryKey: [
      "members",
      { q: debouncedQuery, city: debouncedCity, tier: debouncedTier },
    ],
    queryFn: ({ pageParam }) =>
      fetchMembersPage({
        cursor: typeof pageParam === "number" ? pageParam : 0,
        q: debouncedQuery,
        city: debouncedCity,
        tier: debouncedTier,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const flatMembers = React.useMemo(() => {
    return (membersQ.data?.pages ?? []).flatMap((p) => p.items);
  }, [membersQ.data]);

  const total = membersQ.data?.pages?.[0]?.total ?? 0;

  // 5) Infinite scroll sentinel
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    if (!membersQ.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (membersQ.isFetchingNextPage) return;
        membersQ.fetchNextPage();
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    membersQ.hasNextPage,
    membersQ.isFetchingNextPage,
    membersQ.fetchNextPage,
    membersQ,
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-6">
      <BackHome />
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Members</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            URL-synced filters + infinite loading (IntersectionObserver) +
            server-style paging in the queryFn.
          </div>
        </CardHeader>
        <CardContent>
          <MemberFilters
            query={query}
            setQuery={setQuery}
            city={city}
            setCity={setCity}
            tier={tier}
            setTier={setTier}
          />
        </CardContent>
      </Card>

      {membersQ.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-30 rounded-2xl" />
          ))}
        </div>
      ) : membersQ.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            Failed to load members.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Loaded{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {flatMembers.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {total}
            </span>
          </div>

          {flatMembers.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                No members match your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {flatMembers.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          )}

          {/* Sentinel (auto loads next page) */}
          <div ref={sentinelRef} />

          {/* Loading more skeletons */}
          {membersQ.isFetchingNextPage ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-30 rounded-2xl" />
              ))}
            </div>
          ) : null}

          {/* Fallback button (nice for accessibility + manual control) */}
          {membersQ.hasNextPage ? (
            <div className="pt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Scroll to load more…
            </div>
          ) : (
            <div className="pt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              You’ve reached the end.
            </div>
          )}

          <MemberDrawer members={flatMembers} />
        </>
      )}
    </div>
  );
}
