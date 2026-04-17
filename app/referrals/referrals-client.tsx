"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { ReferralCard } from "@/components/referrals/referral-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackHome } from "@/components/layout/back-home";

import type { Referral } from "@/types/domain";
import { referralSchema } from "@/lib/validators";
import { simulatedLatency } from "@/lib/utils";
import {
  getReferral,
  generateNewReferral,
  resetReferralDb,
  simulateInvite,
} from "@/mock/referrals-db";

async function fetchReferral(): Promise<Referral> {
  await simulatedLatency();
  return referralSchema.parse(getReferral());
}

async function generateReferralMutation(): Promise<Referral> {
  await simulatedLatency();
  return referralSchema.parse(generateNewReferral());
}

async function simulateInviteMutation(): Promise<Referral> {
  await simulatedLatency();
  return referralSchema.parse(simulateInvite());
}

export default function ReferralsPage() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const debug = sp.get("debug") === "1";

  // Declare UI state first so handlers can reference it without relying on hoisting
  const [copied, setCopied] = React.useState(false);

  const referralQ = useQuery({
    queryKey: ["referral"],
    queryFn: fetchReferral,
  });

  const genM = useMutation({
    mutationFn: generateReferralMutation,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["referral"] });
      const prev = qc.getQueryData<Referral>(["referral"]);

      // Optimistic: show the code immediately; count/invites reset
      const optimistic: Referral = {
        code: `FRONTIER-${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`,
        createdAtISO: new Date().toISOString(),
        invitedCount: 0,
        invites: [],
      };
      qc.setQueryData(["referral"], optimistic);

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["referral"], ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(["referral"], data);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["referral"] });
    },
  });

  const inviteM = useMutation({
    mutationFn: simulateInviteMutation,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["referral"] });
      const prev = qc.getQueryData<Referral>(["referral"]);

      // Optimistic: bump the count immediately so the badge updates instantly.
      // The real invitee name/city fills in when the mutation resolves.
      qc.setQueryData<Referral>(["referral"], (old) => {
        if (!old) return old;
        return { ...old, invitedCount: old.invitedCount + 1 };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["referral"], ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(["referral"], data);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["referral"] });
    },
  });

  async function handleCopy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // If clipboard is blocked, we still show the "copied" affordance so the
      // user gets visual feedback; the fallback inside the card covers this.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function handleReset() {
    resetReferralDb();
    qc.invalidateQueries({ queryKey: ["referral"] });
  }

  if (referralQ.isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card>
          <CardContent className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading referrals...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (referralQ.isError || !referralQ.data) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            Failed to load referral data.
          </CardContent>
        </Card>
      </div>
    );
  }

  const referral = referralQ.data;
  const base = "https://demo.network-society.example/join";
  const link = `${base}?ref=${encodeURIComponent(referral.code)}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 p-6">
      <BackHome />
      <ReferralCard
        referral={referral}
        link={link}
        copied={copied}
        onCopy={() => handleCopy(link)}
        onGenerate={() => genM.mutate()}
        onSimulateInvite={() => inviteM.mutate()}
        showDebug={debug}
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          {debug
            ? "Debug mode: simulate invites and reset the mock DB."
            : "Tip: open /referrals?debug=1 to simulate invites."}
        </div>

        {debug ? (
          <Button
            variant="ghost"
            onClick={handleReset}
            title="Reset referral DB"
          >
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
