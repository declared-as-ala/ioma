import { create } from "zustand";

// Genuinely client-only UI state (drawer open/closed) — never server data,
// per CLAUDE.md "Zustand ... never for server data". Cart contents
// themselves live in TanStack Query (see hooks/use-cart.ts).
interface CartDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCartDrawerStore = create<CartDrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
