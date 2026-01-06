"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberCard } from "@/components/members/member-card";
import { MemberDrawer } from "@/components/members/member-drawer";
import { MemberFilters } from "@/components/members/member-filters";

import type { Member, MemberTier } from "@/types/domain";
import { membersMock } from "@/mock/members";
import { sleep } from "@/lib/utils";
import { memberSchema } from "@/lib/validators";

const membersArraySchema = z.array(memberSchema);

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

async function fetchMembersMock(): Promise<Member[]> {
  await sleep(350);
  return membersArraySchema.parse(membersMock);
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

export default function MembersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 1) Initialize state from URL (first render)
  const initial = React.useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      city: searchParams.get("city") ?? "",
      tier: normalizeTier(searchParams.get("tier")),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once to "seed" state from initial URL

  const [query, setQuery] = React.useState(initial.q);
  const [city, setCity] = React.useState(initial.city);
  const [tier, setTier] = React.useState<MemberTier | "all">(initial.tier);

  // Debounce both filtering AND URL updates (prevents “URL spam”)
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const debouncedCity = useDebouncedValue(city.trim(), 250);
  const debouncedTier = useDebouncedValue(tier, 150);

  const membersQ = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembersMock,
  });

  // --- 2) Update URL when (debounced) filters change
  const didMountRef = React.useRef(false);

  React.useEffect(() => {
    // skip URL write on first mount (we already read from URL)
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const next = buildSearchParams({
      q: debouncedQuery,
      city: debouncedCity,
      tier: debouncedTier,
    });

    // avoid replace() if it’s already the same
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
    // NOTE: searchParams must be included so we can compare current vs next
    searchParams,
  ]);

  // --- 3) Sync state when URL changes (back/forward navigation)
  React.useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlCity = searchParams.get("city") ?? "";
    const urlTier = normalizeTier(searchParams.get("tier"));

    // only update if different (prevents loops)
    if (urlQ !== query) setQuery(urlQ);
    if (urlCity !== city) setCity(urlCity);
    if (urlTier !== tier) setTier(urlTier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // intentionally only react to URL changes

  const filtered = React.useMemo(() => {
    const data = membersQ.data ?? [];
    const q = debouncedQuery.toLowerCase();
    const c = debouncedCity.toLowerCase();

    return data.filter((m) => {
      const matchesTier =
        debouncedTier === "all" ? true : m.tier === debouncedTier;
      const matchesCity = c ? m.city.toLowerCase().includes(c) : true;

      const matchesQuery = q
        ? m.name.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q))
        : true;

      return matchesTier && matchesCity && matchesQuery;
    });
  }, [membersQ.data, debouncedQuery, debouncedCity, debouncedTier]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Members</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            URL-synced filters (
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">q</code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              city
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              tier
            </code>
            ) so search is shareable.
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
          {Array.from({ length: 6 }).map((_, i) => (
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
            Showing{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {filtered.length}
            </span>{" "}
            member{filtered.length === 1 ? "" : "s"}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>

          <MemberDrawer members={membersQ.data ?? []} />
        </>
      )}
    </div>
  );
}
