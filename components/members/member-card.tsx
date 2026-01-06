"use client";

import type { Member } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function tierStyles(tier: Member["tier"]) {
  if (tier === "founder")
    return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200";
  if (tier === "resident")
    return "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-200";
  return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200";
}

function tierLabel(tier: Member["tier"]) {
  if (tier === "founder") return "Founder";
  if (tier === "resident") return "Resident";
  return "Citizen";
}

export function MemberCard({ member }: { member: Member }) {
  const open = useUIStore((s) => s.openMemberDrawer);

  return (
    <button
      type="button"
      onClick={() => open(member.id)}
      className="group text-left"
      aria-label={`Open member ${member.name}`}
    >
      <div className="rounded-2xl bg-linear-to-br from-zinc-200 via-zinc-100 to-white p-px dark:from-zinc-800 dark:via-zinc-900 dark:to-black">
        <div
          className={cn(
            "rounded-2xl bg-white p-4 shadow-sm transition",
            "group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-zinc-300",
            "dark:bg-zinc-950 dark:group-focus-visible:ring-zinc-700"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl",
                "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              )}
              aria-hidden="true"
            >
              <span className="text-xs font-semibold">
                {initials(member.name)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {member.name}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {member.city} • Joined {formatDate(member.joinedAtISO)}
                  </div>
                </div>

                <Badge
                  className={cn("shrink-0 border", tierStyles(member.tier))}
                >
                  {tierLabel(member.tier)}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {member.skills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700",
                      "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    )}
                  >
                    {s}
                  </span>
                ))}
                {member.skills.length > 4 ? (
                  <span
                    className={cn(
                      "rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700",
                      "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    )}
                  >
                    +{member.skills.length - 4}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
