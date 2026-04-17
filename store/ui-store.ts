import { create } from "zustand";

type UIState = {
  // Member drawer
  selectedMemberId: string | null;
  isMemberDrawerOpen: boolean;
  openMemberDrawer: (memberId: string) => void;
  closeMemberDrawer: () => void;

  // Global latency control (debug). Persists across pages until the tab is reloaded.
  latencyMs: number;
  setLatencyMs: (ms: number) => void;
};

export const useUIStore = create<UIState>((set) => ({
  selectedMemberId: null,
  isMemberDrawerOpen: false,

  openMemberDrawer: (memberId) =>
    set({ selectedMemberId: memberId, isMemberDrawerOpen: true }),

  closeMemberDrawer: () =>
    set({ selectedMemberId: null, isMemberDrawerOpen: false }),

  latencyMs: 350,
  setLatencyMs: (ms) => set({ latencyMs: Math.max(0, Math.round(ms)) }),
}));
