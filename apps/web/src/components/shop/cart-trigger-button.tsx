"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useCartQuery } from "@/hooks/use-cart";
import { useCartDrawerStore } from "@/stores/cart-drawer-store";
import { Button } from "@/components/ui/button";

export function CartTriggerButton() {
  const t = useTranslations("Nav");
  const open = useCartDrawerStore((s) => s.open);
  const { data: cart } = useCartQuery();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t("bag")}
      data-testid="cart-trigger"
      onClick={open}
      className="relative"
    >
      <ShoppingBag className="size-4" />
      <AnimatePresence mode="wait">
        {cart && cart.itemCount > 0 ? (
          <motion.span
            key={cart.itemCount}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            aria-hidden
            className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] text-primary-foreground font-medium"
          >
            {cart.itemCount}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Button>
  );
}
