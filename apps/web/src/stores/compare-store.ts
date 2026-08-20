import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductListItem } from "@ioma/types";

interface CompareStore {
  items: ProductListItem[];
  addItem: (product: ProductListItem) => boolean;
  removeItem: (slug: string) => void;
  clear: () => void;
  isInCompare: (slug: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: ProductListItem) => {
        const { items } = get();
        if (items.some((i) => i.slug === product.slug)) {
          return false;
        }
        if (items.length >= 3) {
          return false;
        }
        set({ items: [...items, product] });
        return true;
      },
      removeItem: (slug: string) => {
        set({ items: get().items.filter((i) => i.slug !== slug) });
      },
      clear: () => set({ items: [] }),
      isInCompare: (slug: string) => {
        return get().items.some((i) => i.slug === slug);
      },
    }),
    {
      name: "ioma-compare-storage",
    },
  ),
);
