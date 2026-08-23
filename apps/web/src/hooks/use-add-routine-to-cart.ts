import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Cart, RoutineVariant } from "@ioma/types";
import { apiFetch } from "@/lib/api";
import { guestHeaders } from "@/hooks/use-cart";
import { useCartDrawerStore } from "@/stores/cart-drawer-store";

// Shared by both diagnosis flows (standard + AI) — "add this routine to
// cart" adds all products sequentially and opens the slide-over cart drawer.
export function useAddRoutineToCart() {
  const queryClient = useQueryClient();
  const openCartDrawer = useCartDrawerStore((s) => s.open);

  return useMutation({
    mutationFn: async (variants: RoutineVariant[]) => {
      let cart: Cart | undefined;
      for (const variant of variants) {
        try {
          cart = await apiFetch<Cart>("/cart/items", {
            method: "POST",
            headers: guestHeaders(),
            body: JSON.stringify({ sku: variant.sku, qty: 1 }),
          });
        } catch (err) {
          console.warn(`Could not add SKU ${variant.sku} to cart:`, err);
        }
      }

      if (!cart) {
        cart = await apiFetch<Cart>("/cart", { headers: guestHeaders() }).catch(() => undefined);
      }

      return cart;
    },
    onSuccess: (cart) => {
      if (cart) {
        queryClient.setQueryData(["cart"], cart);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      openCartDrawer();
    },
  });
}
