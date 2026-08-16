"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { VARIANTS, TRANSITIONS, getMotionVariant } from "@/lib/motion-tokens";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const variant = getMotionVariant(VARIANTS.pageContent, !!shouldReduceMotion);

  return (
    <motion.div
      key={pathname}
      initial={variant.initial}
      animate={variant.animate}
      transition={TRANSITIONS.page}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}
