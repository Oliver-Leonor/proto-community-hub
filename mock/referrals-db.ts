import type { InviteEvent, Referral } from "@/types/domain";
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

// Small seeded list of realistic invitee profiles. Picked round-robin so the
// invite log grows with believable names/cities instead of "Person 4".
const SIMULATED_INVITEES: Array<Pick<InviteEvent, "inviteeName" | "inviteeCity">> = [
  { inviteeName: "Sofia Delgado", inviteeCity: "Cebu" },
  { inviteeName: "Rafael Marquez", inviteeCity: "Manila" },
  { inviteeName: "Yuki Tanaka", inviteeCity: "Tokyo" },
  { inviteeName: "Nadia Ahmed", inviteeCity: "Davao" },
  { inviteeName: "Ethan Wright", inviteeCity: "Melbourne" },
  { inviteeName: "Lena Park", inviteeCity: "Seoul" },
  { inviteeName: "Kofi Mensah", inviteeCity: "Accra" },
  { inviteeName: "Ines Carvalho", inviteeCity: "Lisbon" },
];

export function generateNewReferral(): Referral {
  referralDb = {
    code: randomCode(),
    createdAtISO: new Date().toISOString(),
    invitedCount: 0,
    invites: [],
  };
  return referralDb;
}

export function simulateInvite(): Referral {
  const idx = referralDb.invitedCount % SIMULATED_INVITEES.length;
  const pick = SIMULATED_INVITEES[idx];
  const newInvite: InviteEvent = {
    id: `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    inviteeName: pick.inviteeName,
    inviteeCity: pick.inviteeCity,
    acceptedAtISO: new Date().toISOString(),
  };

  referralDb = {
    ...referralDb,
    invitedCount: referralDb.invitedCount + 1,
    // Newest first, capped at the most recent 20 invites
    invites: [newInvite, ...referralDb.invites].slice(0, 20),
  };
  return referralDb;
}

export function resetReferralDb(): void {
  referralDb = clone(referralMock);
}
