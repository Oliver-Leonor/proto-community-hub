import type { Event } from "@/types/domain";

export const eventsMock: Event[] = [
  {
    id: "e_001",
    title: "Builders Night: Shipping Fast Without Breaking Things",
    city: "Cebu",
    startsAtISO: "2026-01-20T11:00:00.000Z",
    capacity: 50,
    booked: 17,
  },
  {
    id: "e_002",
    title: "Community Onboarding Q&A",
    city: "Manila",
    startsAtISO: "2026-01-15T10:00:00.000Z",
    capacity: 80,
    booked: 63,
  },
];
