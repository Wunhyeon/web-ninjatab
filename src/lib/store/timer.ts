// lib/store/user.ts

import { create } from "zustand";

interface TimerState {
  timerId: string | null;
  setTimerId: (timerId: string | null) => void;
}

export const useUser = create<TimerState>()((set) => ({
  timerId: null, // default state
  setTimerId: (timerId) => set((state) => ({ timerId })),
}));
