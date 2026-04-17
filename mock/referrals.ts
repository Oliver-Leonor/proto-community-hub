import type { Referral } from "@/types/domain";

// Seeded three invites across realistic timestamps so the invite log has
// something to render on first load. The mock DB adds new invites on top.
export const referralMock: Referral = {
  code: "FRONTIER-OLIVER",
  createdAtISO: "2026-01-06T09:00:00.000Z",
  invitedCount: 3,
  invites: [
    {
      id: "inv_001",
      inviteeName: "Mara Villanueva",
      inviteeCity: "Cebu",
      acceptedAtISO: "2026-01-08T03:12:00.000Z",
    },
    {
      id: "inv_002",
      inviteeName: "Jin Okafor",
      inviteeCity: "Manila",
      acceptedAtISO: "2026-01-11T14:40:00.000Z",
    },
    {
      id: "inv_003",
      inviteeName: "Priya Ramanathan",
      inviteeCity: "Davao",
      acceptedAtISO: "2026-01-18T21:05:00.000Z",
    },
  ],
};
