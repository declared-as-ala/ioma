import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Cart, RoutineVariant } from "@ioma/types";
import { apiFetch } from "@/lib/api";
import { guestHeaders } from "@/hooks/use-cart";

// Shared by both diagnosis flows (standard + AI) — "add this routine to
// cart" is one user action (one click) even though it's several sequential
// POST /cart/items calls under the hood, since the cart API has no bulk-add
// endpoint. Sequential, not Promise.all, so stock/qty conflicts surface in
// a stable order rather than racing each other.
export function useAddRoutineToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variants: RoutineVariant[]) => {
      let cart: Cart | undefined;
      for (const variant of variants) {
        cart = await apiFetch<Cart>("/cart/items", {
          method: "POST",
          headers: guestHeaders(),
          body: JSON.stringify({ sku: variant.sku, qty: 1 }),
        });
      }
      return cart;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(["cart"], cart);
    },
  });
}
