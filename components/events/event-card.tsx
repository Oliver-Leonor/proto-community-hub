"use client";

import * as React from "react";
import type { Event } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookSeatButton } from "@/components/events/book-seat-button";
import { formatDate } from "@/lib/utils";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function EventCard({ event }: { event: Event }) {
  const seatsLeft = Math.max(0, event.capacity - event.booked);
  const isFull = event.booked >= event.capacity;
  const ratio = event.capacity > 0 ? clamp01(event.booked / event.capacity) : 0;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {event.title}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {event.city} • {formatDate(event.startsAtISO)}
            </div>
          </div>

          <Badge>{isFull ? "Full" : `${seatsLeft} left`}</Badge>
        </div>

        {/* capacity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>
              {event.booked}/{event.capacity} booked
            </span>
            <span>{Math.round(ratio * 100)}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div
              className="h-2 rounded-full bg-zinc-900 dark:bg-white"
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Booking is optimistic (instant UI) with rollback-ready logic.
          </div>
          <BookSeatButton eventId={event.id} disabled={isFull} />
        </div>
      </CardContent>
    </Card>
  );
}
