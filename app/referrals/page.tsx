/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

import { ReferralCard } from "@/components/referrals/referral-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { Referral } from "@/types/domain";
import { referralSchema } from "@/lib/validators";
import { sleep } from "@/lib/utils";
import {
  getReferral,
  generateNewReferral,
  resetReferralDb,
  simulateInvite,
} from "@/mock/referrals-db";

const referralZ = referralSchema;

async function fetchReferral(): Promise<Referral> {
  await sleep(250);
  return referralZ.parse(getReferral());
}

async function generateReferralMutation(): Promise<Referral> {
  await sleep(250);
  return referralZ.parse(generateNewReferral());
}

async function simulateInviteMutation(): Promise<Referral> {
  await sleep(150);
  return referralZ.parse(simulateInvite());
}

export default function ReferralsPage() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const debug = sp.get("debug") === "1";

  const referralQ = useQuery({
    queryKey: ["referral"],
    queryFn: fetchReferral,
  });

  const genM = useMutation({
    mutationFn: generateReferralMutation,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["referral"] });
      const prev = qc.getQueryData<Referral>(["referral"]);

      // optimistic: new code immediately (still valid)
      const optimistic: Referral = {
        code: `FRONTIER-${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`,
        createdAtISO: new Date().toISOString(),
        invitedCount: 0,
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

      qc.setQueryData<Referral>(["referral"], (old) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!old) return old as any;
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
      // delegate copy to component utility by clicking “Copy link”
      // but we’ll also show immediate feedback here with a tiny state
      // (keeps it demo-friendly without adding toast libs)
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // if clipboard is blocked, the component has a fallback
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  const [copied, setCopied] = React.useState(false);

  if (referralQ.isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card>
          <CardContent className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading referrals…
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

  // We don’t know their real domain; keep it clearly “demo”.
  const base = "https://demo.network-society.example/join";
  const link = `${base}?ref=${encodeURIComponent(referral.code)}`;

  function handleReset() {
    resetReferralDb();
    qc.invalidateQueries({ queryKey: ["referral"] });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 p-6">
      <ReferralCard
        referral={referral}
        link={link}
        onCopy={() => handleCopy(link)}
        onGenerate={() => genM.mutate()}
        onSimulateInvite={() => inviteM.mutate()}
        showDebug={debug}
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          {copied
            ? "Copied!"
            : "Tip: open /referrals?debug=1 to simulate invites + reset."}
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
