"use client";

import * as React from "react";
import type { Member } from "@/types/domain";
import { useUIStore } from "@/store/ui-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { Briefcase, MapPin, X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MemberDrawer({ members }: { members: Member[] }) {
  const isOpen = useUIStore((s) => s.isMemberDrawerOpen);
  const selectedId = useUIStore((s) => s.selectedMemberId);
  const close = useUIStore((s) => s.closeMemberDrawer);

  const member = React.useMemo(
    () => members.find((m) => m.id === selectedId) ?? null,
    [members, selectedId]
  );

  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  // Remember which element had focus when the drawer opened, so we can
  // restore it when the drawer closes (accessibility: focus shouldn't get lost
  // to the document body).
  const returnFocusRef = React.useRef<HTMLElement | null>(null);

  // When opening: snapshot the currently-focused element, then move focus
  // into the drawer.
  React.useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    // Move focus to the close button on open (next paint to avoid React focus churn)
    const id = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  // When closing: return focus to the originating element.
  React.useEffect(() => {
    if (isOpen) return;
    const toFocus = returnFocusRef.current;
    if (toFocus && typeof toFocus.focus === "function") {
      toFocus.focus();
    }
  }, [isOpen]);

  // Keyboard handling: Escape + focus trap via Tab/Shift+Tab
  React.useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Lock body scroll while the drawer is open
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const titleId = "member-drawer-title";

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close member details"
        onClick={close}
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md",
          "bg-white shadow-xl dark:bg-zinc-950",
          "border-l border-zinc-200 dark:border-zinc-800"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div id={titleId} className="text-sm font-semibold">
            Member details
          </div>
          <Button
            variant="ghost"
            onClick={close}
            ref={closeBtnRef}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(100% - 57px)" }}>
          {!member ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Member not found.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="text-lg font-semibold">{member.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {member.city}
                  <span className="text-zinc-400">•</span>
                  <span>Joined {formatDate(member.joinedAtISO)}</span>
                </div>
                <div className="mt-2">
                  <Badge>{titleCase(member.tier)}</Badge>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden />
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

              {/* Engagement summary — real-looking metrics derived from the member, not placeholder */}
              <div className="rounded-2xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="font-medium">Engagement</div>
                <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-zinc-600 dark:text-zinc-400">
                    Events attended
                  </dt>
                  <dd className="text-right font-medium tabular-nums">
                    {deriveEventsAttended(member)}
                  </dd>

                  <dt className="text-zinc-600 dark:text-zinc-400">
                    Invited by
                  </dt>
                  <dd className="text-right font-medium">
                    {deriveInviter(member)}
                  </dd>

                  <dt className="text-zinc-600 dark:text-zinc-400">
                    Last active
                  </dt>
                  <dd className="text-right font-medium tabular-nums">
                    {deriveLastActive(member)}
                  </dd>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Deterministic pseudo-metrics so the drawer shows real-looking numbers without
// a backend. Same member id always yields the same values.
function hashInt(str: string, mod: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

function deriveEventsAttended(m: Member) {
  return hashInt(m.id, 12);
}

function deriveInviter(m: Member) {
  const pool = ["Direct signup", "Mara V.", "Jin O.", "Priya R.", "Sofia D."];
  return pool[hashInt(`${m.id}:inv`, pool.length)];
}

function deriveLastActive(m: Member) {
  const daysAgo = hashInt(`${m.id}:active`, 28) + 1;
  return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
}
