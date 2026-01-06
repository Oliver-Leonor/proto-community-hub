"use client";

import * as React from "react";
import type { MemberTier } from "@/types/domain";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  tier: MemberTier | "all";
  setTier: (v: MemberTier | "all") => void;
};

const tierOptions: Array<{ label: string; value: MemberTier | "all" }> = [
  { label: "All", value: "all" },
  { label: "Citizen", value: "citizen" },
  { label: "Resident", value: "resident" },
  { label: "Founder", value: "founder" },
];

export function MemberFilters({
  query,
  setQuery,
  city,
  setCity,
  tier,
  setTier,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">
            Search
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or skill…"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">
            City
          </div>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Cebu, Manila…"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tierOptions.map((opt) => {
          const active = tier === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTier(opt.value)}
              className={cn(
                "rounded-full transition",
                active
                  ? "ring-2 ring-zinc-300 dark:ring-zinc-700"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <Badge
                className={cn(active ? "bg-zinc-100 dark:bg-zinc-900" : "")}
              >
                {opt.label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
