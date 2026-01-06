/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { z } from "zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberCard } from "@/components/members/member-card";
import { MemberDrawer } from "@/components/members/member-drawer";
import { MemberFilters } from "@/components/members/member-filters";

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

async function fetchMembersPage(args: {
  cursor: number;
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

  // seed from URL once
  const initial = React.useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      city: searchParams.get("city") ?? "",
      tier: normalizeTier(searchParams.get("tier")),
    };
  }, []);

  const [query, setQuery] = React.useState(initial.q);
  const [city, setCity] = React.useState(initial.city);
  const [tier, setTier] = React.useState<MemberTier | "all">(initial.tier);

  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const debouncedCity = useDebouncedValue(city.trim(), 250);
  const debouncedTier = useDebouncedValue(tier, 150);

  // URL write
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

  // back/forward sync
  React.useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlCity = searchParams.get("city") ?? "";
    const urlTier = normalizeTier(searchParams.get("tier"));

    if (urlQ !== query) setQuery(urlQ);
    if (urlCity !== city) setCity(urlCity);
    if (urlTier !== tier) setTier(urlTier);
  }, [searchParams]);

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

  // infinite scroll sentinel
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
      { root: null, rootMargin: "500px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    membersQ.hasNextPage,
    membersQ.isFetchingNextPage,
    membersQ.fetchNextPage,
  ]);

  function clearFilters() {
    setQuery("");
    setCity("");
    setTier("all");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute -right-28 -top-28 h-64 w-64 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-900" />
        <div className="relative">
          <div className="text-2xl font-semibold">Members Directory</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Shareable URL filters + infinite loading + member detail drawer.
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900">
              Loaded <span className="font-semibold">{flatMembers.length}</span>{" "}
              of <span className="font-semibold">{total}</span>
            </span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900">
              Tip: try
              <span className="font-mono">?tier=citizen&amp;city=cebu</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* FILTERS (sticky on desktop) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 text-sm font-semibold">Filters</div>
              <MemberFilters
                query={query}
                setQuery={setQuery}
                city={city}
                setCity={setCity}
                tier={tier}
                setTier={setTier}
                onClear={clearFilters}
              />
            </CardContent>
          </Card>
        </div>

        {/* RESULTS */}
        <div className="space-y-3">
          {membersQ.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-30 rounded-2xl" />
              ))}
            </div>
          ) : membersQ.isError ? (
            <Card>
              <CardContent className="p-4 text-sm text-red-600">
                Failed to load members.
              </CardContent>
            </Card>
          ) : flatMembers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-zinc-600 dark:text-zinc-400">
                No members match your filters. Try clearing or changing search
                terms.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                {flatMembers.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>

              <div ref={sentinelRef} />

              {membersQ.isFetchingNextPage ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-30 rounded-2xl" />
                  ))}
                </div>
              ) : null}

              <div className="pt-2 text-center text-xs text-zinc-600 dark:text-zinc-400">
                {membersQ.hasNextPage
                  ? "Scroll to load more…"
                  : "You’ve reached the end."}
              </div>
            </>
          )}

          <MemberDrawer members={flatMembers} />
        </div>
      </div>
    </div>
  );
}
