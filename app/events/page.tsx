"use client";

import * as React from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EventCard } from "@/components/events/event-card";

import type { Event } from "@/types/domain";
import { eventsMock } from "@/mock/events";
import { sleep } from "@/lib/utils";
import { eventSchema } from "@/lib/validators";

const eventsArraySchema = z.array(eventSchema);

async function fetchEventsMock(): Promise<Event[]> {
  await sleep(350);
  const validated = eventsArraySchema.parse(eventsMock);

  // sort soonest first
  return [...validated].sort(
    (a, b) =>
      new Date(a.startsAtISO).getTime() - new Date(b.startsAtISO).getTime()
  );
}

export default function EventsPage() {
  const [q, setQ] = React.useState("");

  const eventsQ = useQuery({
    queryKey: ["events"],
    queryFn: fetchEventsMock,
  });

  const filtered = React.useMemo(() => {
    const data = eventsQ.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return data;

    return data.filter((e) => {
      return (
        e.title.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query)
      );
    });
  }, [eventsQ.data, q]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Events</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Optimistic booking with React Query (instant feedback,
            rollback-ready).
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">
              Search
            </div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or city…"
            />
          </div>
        </CardContent>
      </Card>

      {eventsQ.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-37.5 rounded-2xl" />
          ))}
        </div>
      ) : eventsQ.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            Failed to load events.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
            No events match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
