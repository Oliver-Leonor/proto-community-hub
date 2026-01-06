export type MemberTier = "citizen" | "resident" | "founder";

export type Member = {
  id: string;
  name: string;
  city: string;
  skills: string[];
  tier: MemberTier;
  joinedAtISO: string;
};

export type Event = {
  id: string;
  title: string;
  city: string;
  startsAtISO: string;
  capacity: number;
  booked: number;
};

export type Referral = {
  code: string;
  createdAtISO: string;
  invitedCount: number;
};
