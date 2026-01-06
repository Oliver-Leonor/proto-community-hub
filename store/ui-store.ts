import { create } from "zustand";

type UIState = {
  selectedMemberId: string | null;
  isMemberDrawerOpen: boolean;
  openMemberDrawer: (memberId: string) => void;
  closeMemberDrawer: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  selectedMemberId: null,
  isMemberDrawerOpen: false,

  openMemberDrawer: (memberId) =>
    set({ selectedMemberId: memberId, isMemberDrawerOpen: true }),

  closeMemberDrawer: () =>
    set({ selectedMemberId: null, isMemberDrawerOpen: false }),
}));
