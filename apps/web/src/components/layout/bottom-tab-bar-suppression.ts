// Shared between BottomTabBar (hides itself) and BottomTabBarSpacer (stops
// reserving space for it) so the two can never disagree about which routes
// suppress the bar.
export const BOTTOM_TAB_BAR_SUPPRESSED_PREFIXES = ["/checkout"];

export function isBottomTabBarSuppressed(pathname: string): boolean {
  return BOTTOM_TAB_BAR_SUPPRESSED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
