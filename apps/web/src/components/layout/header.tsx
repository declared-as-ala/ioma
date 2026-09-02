"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { IomaLogo } from "@/components/brand/ioma-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CartTriggerButton } from "@/components/shop/cart-trigger-button";
import { AccountLink } from "@/components/layout/account-link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SearchDrawer } from "@/components/shop/search-drawer";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/stores/search-store";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SoinsSurMesureDropdown } from "@/components/layout/soins-sur-mesure-dropdown";
import { InsideIomaDropdown } from "@/components/layout/inside-ioma-dropdown";

type ActiveMenu = "none" | "visage" | "bespoke" | "inside";

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const openSearch = useSearchStore((state) => state.openSearch);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("none");
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard escape listener to close any open mega-menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu("none");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = (menu: ActiveMenu) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu("none");
    }, 150);
  };

  const handleMenuClick = (menu: ActiveMenu) => {
    setActiveMenu((prev) => (prev === menu ? "none" : menu));
  };

  const isHomepage =
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/fr" ||
    pathname === "/ar" ||
    pathname === "" ||
    pathname === "/en/" ||
    pathname === "/fr/" ||
    pathname === "/ar/";

  const isDarkHeader = isHomepage && !isScrolled && activeMenu === "none";

  const isBespokeActive =
    activeMenu === "bespoke" || pathname.includes("soins-sur-mesure");
  const isVisageActive = activeMenu === "visage" || pathname.startsWith("/shop");
  const isInsideActive =
    activeMenu === "inside" ||
    pathname.startsWith("/maison") ||
    pathname.startsWith("/technology") ||
    pathname.startsWith("/journal");

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${
          isDarkHeader
            ? "border-b border-ioma-white/10 bg-ioma-black/40 backdrop-blur-md text-ioma-white"
            : `border-b border-border bg-background text-foreground ${
                isScrolled ? "shadow-md backdrop-blur-md bg-background/95" : ""
              }`
        }`}
        onMouseLeave={handleMouseLeave}
      >
        {/* Utility bar */}
        <div
          className={`border-b transition-colors duration-300 ${
            isDarkHeader
              ? "border-ioma-white/10 bg-ioma-black/50 text-ioma-white/70"
              : "border-border bg-muted/20 text-muted-foreground"
          }`}
        >
          <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between px-4 text-[0.65rem] uppercase tracking-widest md:px-6">
            <div className="flex items-center gap-4">
              <span>
                {t("region")} — {t("currency")}
              </span>
              <span
                className={
                  isDarkHeader
                    ? "hidden sm:inline text-ioma-white/20"
                    : "hidden sm:inline text-border"
                }
              >
                |
              </span>
              <Link
                href="/diagnosis"
                className={`hidden sm:inline-flex items-center gap-1 font-medium transition-colors ${
                  isDarkHeader
                    ? "text-ioma-white hover:text-ioma-violet"
                    : "text-foreground hover:text-primary"
                }`}
              >
                <Sparkles className="size-3 text-ioma-violet" />
                <span>AI Skin Expert 2.0</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/partners"
                className={`hidden md:inline-flex text-[0.65rem] uppercase tracking-wider transition-colors ${
                  isDarkHeader
                    ? "text-ioma-white/70 hover:text-ioma-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("partners")}
              </Link>
              <span
                className={
                  isDarkHeader
                    ? "hidden md:inline text-ioma-white/20"
                    : "hidden md:inline text-border"
                }
              >
                |
              </span>
              <Link
                href="/professionals"
                className={`hidden md:inline-flex text-[0.65rem] uppercase tracking-wider transition-colors ${
                  isDarkHeader
                    ? "text-ioma-white/70 hover:text-ioma-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("professionals")}
              </Link>
              <span
                className={
                  isDarkHeader
                    ? "hidden md:inline text-ioma-white/20"
                    : "hidden md:inline text-border"
                }
              >
                |
              </span>
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        {/* Logo row */}
        <div className="relative mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNavigation />
          </div>

          <Link
            href="/"
            aria-label={t("home")}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <IomaLogo variant={isDarkHeader ? "white" : "black"} />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("search")}
              data-testid="search-trigger"
              onClick={openSearch}
              className={`inline-flex transition-colors ${
                isDarkHeader
                  ? "text-ioma-white hover:bg-ioma-white/10 hover:text-ioma-white"
                  : "hover:bg-muted"
              }`}
            >
              <Search className="size-4" />
            </Button>
            <AccountLink />
            <CartTriggerButton />
            <Button
              asChild
              size="sm"
              className="ms-2 hidden uppercase tracking-widest xl:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Link href="/booking" prefetch={false}>
                {t("bookAppointment")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Primary nav matching ioma-paris.com structure */}
        <nav
          aria-label={t("primaryNavigation")}
          className="mx-auto hidden max-w-[1440px] items-center justify-center gap-8 overflow-visible px-4 py-2.5 md:px-6 xl:flex"
        >
          {/* 1. UV & PROTECTION */}
          <Link
            href="/shop?category=protection-solaire"
            className={`text-xs uppercase tracking-widest font-medium transition-colors ${
              isDarkHeader
                ? pathname.includes("category=protection-solaire")
                  ? "text-ioma-white font-semibold"
                  : "text-ioma-white/75 hover:text-ioma-white"
                : pathname.includes("category=protection-solaire")
                  ? "text-foreground font-semibold"
                  : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {t("uvProtection")}
          </Link>

          {/* 2. SOINS SUR MESURE (Dropdown) */}
          <div className="relative" onMouseEnter={() => handleMouseEnter("bespoke")}>
            <button
              type="button"
              onClick={() => handleMenuClick("bespoke")}
              aria-expanded={activeMenu === "bespoke"}
              aria-haspopup="true"
              className={`flex items-center gap-1 text-xs uppercase tracking-widest font-medium transition-colors ${
                isDarkHeader
                  ? isBespokeActive
                    ? "text-ioma-white font-semibold"
                    : "text-ioma-white/75 hover:text-ioma-white"
                  : isBespokeActive
                    ? "text-foreground font-semibold"
                    : "text-foreground/80 hover:text-foreground"
              }`}
            >
              <span>{t("bespoke")}</span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${activeMenu === "bespoke" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* 3. VISAGE (Mega Menu) */}
          <div className="relative" onMouseEnter={() => handleMouseEnter("visage")}>
            <button
              type="button"
              onClick={() => handleMenuClick("visage")}
              aria-expanded={activeMenu === "visage"}
              aria-haspopup="true"
              className={`flex items-center gap-1 text-xs uppercase tracking-widest font-medium transition-colors ${
                isDarkHeader
                  ? isVisageActive
                    ? "text-ioma-white font-semibold"
                    : "text-ioma-white/75 hover:text-ioma-white"
                  : isVisageActive
                    ? "text-foreground font-semibold"
                    : "text-foreground/80 hover:text-foreground"
              }`}
            >
              <span>{t("visage")}</span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${activeMenu === "visage" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* 4. CORPS */}
          <Link
            href="/shop?category=corps"
            className={`text-xs uppercase tracking-widest font-medium transition-colors ${
              isDarkHeader
                ? pathname.includes("category=corps")
                  ? "text-ioma-white font-semibold"
                  : "text-ioma-white/75 hover:text-ioma-white"
                : pathname.includes("category=corps")
                  ? "text-foreground font-semibold"
                  : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {t("corps")}
          </Link>

          {/* 5. CHEVEUX */}
          <Link
            href="/shop?category=cheveux"
            className={`text-xs uppercase tracking-widest font-medium transition-colors ${
              isDarkHeader
                ? pathname.includes("category=cheveux")
                  ? "text-ioma-white font-semibold"
                  : "text-ioma-white/75 hover:text-ioma-white"
                : pathname.includes("category=cheveux")
                  ? "text-foreground font-semibold"
                  : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {t("cheveux")}
          </Link>

          {/* 6. KITS & ROUTINES */}
          <Link
            href="/shop?category=routines"
            className={`text-xs uppercase tracking-widest font-medium transition-colors ${
              isDarkHeader
                ? pathname.includes("category=routines")
                  ? "text-ioma-white font-semibold"
                  : "text-ioma-white/75 hover:text-ioma-white"
                : pathname.includes("category=routines")
                  ? "text-foreground font-semibold"
                  : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {t("routinesKits")}
          </Link>

          {/* 7. INSIDE IOMA (Dropdown) */}
          <div className="relative" onMouseEnter={() => handleMouseEnter("inside")}>
            <button
              type="button"
              onClick={() => handleMenuClick("inside")}
              aria-expanded={activeMenu === "inside"}
              aria-haspopup="true"
              className={`flex items-center gap-1 text-xs uppercase tracking-widest font-medium transition-colors ${
                isDarkHeader
                  ? isInsideActive
                    ? "text-ioma-white font-semibold"
                    : "text-ioma-white/75 hover:text-ioma-white"
                  : isInsideActive
                    ? "text-foreground font-semibold"
                    : "text-foreground/80 hover:text-foreground"
              }`}
            >
              <span>{t("insideIoma")}</span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${activeMenu === "inside" ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </nav>

        {/* Dropdowns & Mega Menus */}
        <MegaMenu
          isOpen={activeMenu === "visage"}
          onClose={() => setActiveMenu("none")}
        />
        <SoinsSurMesureDropdown
          isOpen={activeMenu === "bespoke"}
          onClose={() => setActiveMenu("none")}
        />
        <InsideIomaDropdown
          isOpen={activeMenu === "inside"}
          onClose={() => setActiveMenu("none")}
        />

        {/* Search Drawer Modal */}
        <SearchDrawer />
      </header>

      {/* Fixed Header Layout Spacer — suppressed on homepage to allow full-bleed Hero */}
      {!isHomepage && (
        <div className="h-[120px] xl:h-[148px] w-full shrink-0" aria-hidden="true" />
      )}
    </>
  );
}
