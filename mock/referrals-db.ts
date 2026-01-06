import type { Referral } from "@/types/domain";
import { referralMock } from "@/mock/referrals";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

let referralDb: Referral = clone(referralMock);

export function getReferral(): Referral {
  return referralDb;
}

function randomCode() {
  // short, readable, URL-safe
  const parts = [
    "FRONTIER",
    Math.random().toString(36).slice(2, 6).toUpperCase(),
    Math.random().toString(36).slice(2, 6).toUpperCase(),
  ];
  return parts.join("-");
}

export function generateNewReferral(): Referral {
  referralDb = {
    code: randomCode(),
    createdAtISO: new Date().toISOString(),
    invitedCount: 0,
  };
  return referralDb;
}

export function simulateInvite(): Referral {
  referralDb = {
    ...referralDb,
    invitedCount: referralDb.invitedCount + 1,
  };
  return referralDb;
}

export function resetReferralDb(): void {
  referralDb = clone(referralMock);
}
