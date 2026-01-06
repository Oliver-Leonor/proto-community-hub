"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/domain";
import { sleep } from "@/lib/utils";
import { bookSeatInDb } from "@/mock/events-db";

async function bookSeatMock(eventId: string) {
  await sleep(350);
  const updated = bookSeatInDb(eventId);
  if (!updated) throw new Error("Event not found");
  return updated; // return updated Event
}

export function BookSeatButton({
  eventId,
  disabled,
}: {
  eventId: string;
  disabled?: boolean;
}) {
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: () => bookSeatMock(eventId),

    // optimistic update
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["events"] });

      const prev = qc.getQueryData<Event[]>(["events"]);

      qc.setQueryData<Event[]>(["events"], (old) => {
        if (!old) return old;
        return old.map((e) => {
          if (e.id !== eventId) return e;
          // guard against overflow
          if (e.booked >= e.capacity) return e;
          return { ...e, booked: e.booked + 1 };
        });
      });

      return { prev };
    },

    // rollback if error (kept for “senior” completeness)
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["events"], ctx.prev);
    },

    onSuccess: (updatedEvent) => {
      qc.setQueryData<Event[]>(["events"], (old) => {
        if (!old) return old;
        return old.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
      });
    },

    // revalidate (here it’s mock, but mirrors real life)
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return (
    <Button
      onClick={() => m.mutate()}
      disabled={disabled || m.isPending}
      variant={disabled ? "secondary" : "primary"}
    >
      {m.isPending ? "Booking…" : disabled ? "Full" : "Book seat"}
    </Button>
  );
}
