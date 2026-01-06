import { Suspense } from "react";
import EventsClient from "./events-client";

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading events…</div>}>
      <EventsClient />
    </Suspense>
  );
}
