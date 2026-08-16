"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { IomaLogo } from "@/components/brand/ioma-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CartTriggerButton } from "@/components/shop/cart-trigger-button";
import { AccountLink } from "@/components/layout/account-link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SearchDrawer } from "@/components/shop/search-drawer";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/stores/search-store";

const NOT_YET_BUILT = new Set<string>([]);

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const openSearch = useSearchStore((state) => state.openSearch);
  const shouldReduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const primaryLinks = [
    { href: "/maison", label: t("maison") },
    { href: "/technology", label: t("technology") },
    { href: "/diagnosis", label: t("diagnosis") },
    { href: "/shop", label: t("shop") },
    { href: "/treatments", label: t("treatments") },
    { href: "/partners", label: t("partners") },
    { href: "/journal", label: t("journal") },
    { href: "/professionals", label: t("professionals") },
  ] as const;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[100] border-b border-border bg-background transition-shadow duration-200 ${
          isScrolled ? "shadow-md backdrop-blur-md bg-background/95" : ""
        }`}
      >
        {/* Utility bar */}
        <div className="border-b border-border">
          <div className="mx-auto flex min-h-11 max-w-[1440px] items-center justify-between px-4 text-[0.65rem] uppercase tracking-widest text-muted-foreground md:px-6 xl:h-9 xl:min-h-0">
            <span>
              {t("region")} — {t("currency")}
            </span>
            <LocaleSwitcher />
          </div>
        </div>

        {/* Logo row */}
        <div className="relative mx-auto flex h-20 max-w-[1440px] items-center justify-center px-4 md:px-6">
          <div className="absolute inset-y-0 start-4 flex items-center md:start-6">
            <MobileNavigation />
          </div>
          <Link
            href="/"
            aria-label={t("home")}
            className="flex min-h-11 items-center xl:min-h-0"
          >
            <IomaLogo />
          </Link>
          <div className="absolute inset-y-0 end-4 flex items-center gap-1 md:end-6">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("search")}
              data-testid="search-trigger"
              onClick={openSearch}
              className="hidden md:inline-flex hover:bg-ioma-grey-100 transition-colors"
            >
              <Search className="size-4" />
            </Button>
            <AccountLink />
            <CartTriggerButton />
            <Button
              asChild
              size="sm"
              className="ms-2 hidden uppercase tracking-widest xl:inline-flex"
            >
              <Link href="/booking" prefetch={false}>
                {t("bookAppointment")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Primary nav */}
        <nav
          aria-label={t("primaryNavigation")}
          className="mx-auto hidden max-w-[1440px] items-center justify-center gap-6 overflow-x-auto px-4 py-3 md:px-6 xl:flex"
        >
          {primaryLinks.map((link) => {
            const isActive =
              pathname.endsWith(link.href) || pathname.includes(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={NOT_YET_BUILT.has(link.href) ? false : undefined}
                className={`relative whitespace-nowrap text-xs uppercase tracking-widest transition-colors ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId={shouldReduceMotion ? undefined : "header-active-underline"}
                    className="absolute -bottom-1 inset-x-0 h-[1.5px] bg-ioma-violet"
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search Drawer Modal */}
        <SearchDrawer />
      </header>

      {/* Fixed Header Layout Spacer */}
      <div className="h-[124px] xl:h-[160px] w-full shrink-0" aria-hidden="true" />
    </>
  );
}
