export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Sleep using the debug latency from the UI store.
 * This is the single source of truth for fake network delay across the app,
 * so the debug latency slider (Item 3 in DECISIONS.md) actually affects every
 * query and mutation.
 */
export async function simulatedLatency() {
  // Inline import to avoid a client/server module cycle at build time.
  const { useUIStore } = await import("@/store/ui-store");
  const ms = useUIStore.getState().latencyMs;
  if (ms > 0) await sleep(ms);
}

