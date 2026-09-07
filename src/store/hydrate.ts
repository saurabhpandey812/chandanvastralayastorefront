import { create } from 'zustand';

interface HydrateState {
  hydrated: boolean;
  setHydrated: () => void;
}

export const useHydrated = create<HydrateState>((set) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));
