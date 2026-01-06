"use client";

import type { Member } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

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
      className="text-left"
      aria-label={`Open member ${member.name}`}
    >
      <Card
        className={cn(
          "transition hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
        )}
      >
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {member.name}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {member.city} • Joined {formatDate(member.joinedAtISO)}
              </div>
            </div>

            <Badge className="shrink-0">{tierLabel(member.tier)}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {member.skills.slice(0, 4).map((s) => (
              <Badge key={s} className="bg-white dark:bg-zinc-950">
                {s}
              </Badge>
            ))}
            {member.skills.length > 4 ? (
              <Badge className="bg-white dark:bg-zinc-950">
                +{member.skills.length - 4}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
