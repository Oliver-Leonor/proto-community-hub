"use client";

import * as React from "react";
import type { Referral } from "@/types/domain";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import { Check, Copy, Sparkles, UserPlus } from "lucide-react";

export function ReferralCard({
  referral,
  link,
  copied,
  onCopy,
  onGenerate,
  onSimulateInvite,
  showDebug,
}: {
  referral: Referral;
  link: string;
  copied: boolean;
  onCopy: () => void;
  onGenerate: () => void;
  onSimulateInvite: () => void;
  showDebug: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Referrals</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Share your link, track accepted invites, and see the funnel live.
            </div>
          </div>

          <Badge className="shrink-0">
            {referral.invitedCount}{" "}
            {referral.invitedCount === 1 ? "invite" : "invites"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Code panel */}
        <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Referral code
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-sm font-semibold">
              {referral.code}
            </div>
            <Button variant="secondary" onClick={onGenerate}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Generate new
            </Button>
          </div>

          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Created {formatDate(referral.createdAtISO)}
          </div>
        </div>

        {/* Share link panel */}
        <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Share link
          </div>
          <div className="mt-1 break-all rounded-xl bg-zinc-50 p-2 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            {link}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={onCopy} aria-live="polite">
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Copy link
                </>
              )}
            </Button>

            {showDebug ? (
              <Button
                variant="ghost"
                onClick={onSimulateInvite}
                title="Debug: simulate an invite accepting"
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Simulate invite
              </Button>
            ) : null}
          </div>
        </div>

        {/* Invite log */}
        <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Recent invites
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              {referral.invites.length > 0
                ? `Showing ${Math.min(5, referral.invites.length)} of ${
                    referral.invitedCount
                  }`
                : "None yet"}
            </div>
          </div>

          {referral.invites.length === 0 ? (
            <div className="mt-3 rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              No invites yet. Share your link to get started.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {referral.invites.slice(0, 5).map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
                      aria-hidden
                    >
                      {initials(invite.inviteeName)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {invite.inviteeName}
                      </div>
                      <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                        {invite.inviteeCity}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-600 dark:text-zinc-400">
                    <div>{formatDate(invite.acceptedAtISO)}</div>
                    <div className="tabular-nums">
                      {formatTime(invite.acceptedAtISO)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}
