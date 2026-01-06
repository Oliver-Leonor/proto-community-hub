"use client";

import * as React from "react";
import type { Member } from "@/types/domain";
import { useUIStore } from "@/store/ui-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export function MemberDrawer({ members }: { members: Member[] }) {
  const isOpen = useUIStore((s) => s.isMemberDrawerOpen);
  const selectedId = useUIStore((s) => s.selectedMemberId);
  const close = useUIStore((s) => s.closeMemberDrawer);

  const member = React.useMemo(
    () => members.find((m) => m.id === selectedId) ?? null,
    [members, selectedId]
  );

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close drawer"
        onClick={close}
      />

      {/* panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md",
          "bg-white shadow-xl dark:bg-zinc-950",
          "border-l border-zinc-200 dark:border-zinc-800"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-sm font-semibold">Member details</div>
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
        </div>

        <div className="p-4">
          {!member ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Member not found.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold">{member.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {member.city} • Joined {formatDate(member.joinedAtISO)}
                </div>
                <div className="mt-2">
                  <Badge>{member.tier}</Badge>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((s) => (
                    <Badge key={s} className="bg-white dark:bg-zinc-950">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="font-medium">Notes (mock)</div>
                <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                  This is where you could show on-chain credentials, referrals,
                  event history, and access permissions—without changing the
                  page architecture.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
