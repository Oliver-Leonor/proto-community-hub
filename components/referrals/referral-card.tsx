"use client";

import * as React from "react";
import type { Referral } from "@/types/domain";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function copyText(text: string) {
  // modern clipboard
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // fallback
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function ReferralCard({
  referral,
  link,
  onCopy,
  onGenerate,
  onSimulateInvite,
  showDebug,
}: {
  referral: Referral;
  link: string;
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
              Shareable referral link + mutations (generate / invite).
            </div>
          </div>

          <Badge>{referral.invitedCount} invited</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Referral code
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-sm font-semibold">
              {referral.code}
            </div>
            <Button variant="secondary" onClick={onGenerate}>
              Generate new
            </Button>
          </div>

          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Created {formatDate(referral.createdAtISO)}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Share link
          </div>
          <div className="mt-1 break-all rounded-xl bg-zinc-50 p-2 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            {link}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={onCopy}>Copy link</Button>

            {showDebug ? (
              <Button
                variant="ghost"
                onClick={onSimulateInvite}
                title="Debug: increment invited count"
              >
                Simulate invite
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
