import type { Member } from "@/types/domain";

export const membersMock: Member[] = [
  {
    id: "m_001",
    name: "Ari Santos",
    city: "Cebu",
    skills: ["React", "TypeScript", "Design Systems"],
    tier: "citizen",
    joinedAtISO: "2025-10-10T08:00:00.000Z",
  },
  {
    id: "m_002",
    name: "Kai Dela Cruz",
    city: "Manila",
    skills: ["Next.js", "Performance", "Analytics"],
    tier: "resident",
    joinedAtISO: "2025-11-05T08:00:00.000Z",
  },
  {
    id: "m_003",
    name: "Sam Rivera",
    city: "Davao",
    skills: ["Product", "UX", "Community"],
    tier: "founder",
    joinedAtISO: "2025-09-01T08:00:00.000Z",
  },
];
