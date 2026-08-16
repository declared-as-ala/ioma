"use client";

import { usePathname } from "@/i18n/navigation";
import { isBottomTabBarSuppressed } from "./bottom-tab-bar-suppression";

// Reserves the space BottomTabBar occupies so page content (and the
// footer) never renders underneath it — only on routes where the bar
// actually renders, so /checkout doesn't carry dead bottom whitespace for
// a bar that isn't there.
export function BottomTabBarSpacer() {
  const pathname = usePathname();
  if (isBottomTabBarSuppressed(pathname)) return null;

  return (
    <div
      aria-hidden
      className="xl:hidden"
      style={{ height: "calc(4rem + env(safe-area-inset-bottom))" }}
    />
  );
}
