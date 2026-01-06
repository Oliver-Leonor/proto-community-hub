import type { Event } from "@/types/domain";
import { eventsMock } from "@/mock/events";

// Deep copy helper
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// Simple in-memory DB (resets on refresh / dev restart)
let eventsDb: Event[] = clone(eventsMock);

export function listEvents(): Event[] {
  return eventsDb;
}

export function bookSeatInDb(eventId: string): Event | null {
  const idx = eventsDb.findIndex((e) => e.id === eventId);
  if (idx === -1) return null;

  const e = eventsDb[idx];
  if (e.booked >= e.capacity) return e;

  const updated: Event = { ...e, booked: e.booked + 1 };
  eventsDb = [...eventsDb.slice(0, idx), updated, ...eventsDb.slice(idx + 1)];
  return updated;
}

export function resetEventsDb(): void {
  eventsDb = clone(eventsMock);
}
