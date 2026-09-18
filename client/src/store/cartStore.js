import { create } from "zustand";
import { getCarts } from "@/lib/cart";

export const useCartStore = create((set) => ({
  count: 0,

  async refreshCount() {
    try {
      const carts = await getCarts();
      const total = carts.reduce(
        (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0),
        0,
      );
      set({ count: total });
    } catch {
      set({ count: 0 });
    }
  },

  increment(by = 1) {
    set((state) => ({ count: state.count + by }));
  },
}));
