"use client";

import { useState } from "react";
import { Menu, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRODUCT_RANGE_COLORS } from "@ioma/config";

type NavScreen = "root" | "bespoke" | "visage" | "inside";

export function MobileNavigation() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const [screen, setScreen] = useState<NavScreen>("root");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => setScreen("root"), 250);
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="xl:hidden"
          aria-label={t("openMenu")}
          data-testid="mobile-nav-trigger"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "right" : "left"}
        className="w-full max-w-sm p-0 flex flex-col bg-background"
        showCloseButton={true}
        data-testid="mobile-nav"
      >
        <SheetHeader className="p-4 border-b border-border text-start">
          <SheetTitle className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            {screen === "root" ? (
              t("primaryNavigation")
            ) : (
              <button
                type="button"
                onClick={() => setScreen("root")}
                className="flex items-center gap-1.5 text-foreground hover:text-ioma-violet transition-colors"
              >
                <ChevronLeft className="size-4 rtl:rotate-180" />
                <span>{t("back")}</span>
              </button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* ROOT SCREEN */}
          {screen === "root" && (
            <nav className="flex flex-col space-y-1" aria-label={t("primaryNavigation")}>
              <SheetClose asChild>
                <Link
                  href="/shop?category=protection-solaire"
                  className="flex min-h-[44px] items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
                >
                  <span>{t("uvProtection")}</span>
                </Link>
              </SheetClose>

              <button
                type="button"
                onClick={() => setScreen("bespoke")}
                className="flex min-h-[44px] w-full items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-ioma-violet" />
                  <span>{t("bespoke")}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => setScreen("visage")}
                className="flex min-h-[44px] w-full items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
              >
                <span>{t("visage")}</span>
                <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
              </button>

              <SheetClose asChild>
                <Link
                  href="/shop?category=corps"
                  className="flex min-h-[44px] items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
                >
                  <span>{t("corps")}</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/shop?category=cheveux"
                  className="flex min-h-[44px] items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
                >
                  <span>{t("cheveux")}</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/shop?category=routines"
                  className="flex min-h-[44px] items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
                >
                  <span>{t("routinesKits")}</span>
                </Link>
              </SheetClose>

              <button
                type="button"
                onClick={() => setScreen("inside")}
                className="flex min-h-[44px] w-full items-center justify-between border-b border-border/50 px-2 text-xs uppercase tracking-widest font-medium text-foreground hover:text-ioma-violet transition-colors"
              >
                <span>{t("insideIoma")}</span>
                <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
              </button>

              {/* Diagnosis & Booking Quick CTAs */}
              <div className="pt-6 space-y-3">
                <SheetClose asChild>
                  <Link
                    href="/diagnosis"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-ioma-violet px-4 text-xs uppercase tracking-widest font-semibold text-white shadow-sm hover:bg-ioma-violet/90 transition-colors"
                  >
                    <Sparkles className="size-3.5" />
                    <span>{t("startDiagnosisCta")}</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/booking"
                    className="flex min-h-[44px] items-center justify-center rounded-sm border border-border px-4 text-xs uppercase tracking-widest font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    {t("bookAppointment")}
                  </Link>
                </SheetClose>
              </div>
            </nav>
          )}

          {/* BESPOKE SUBMENU */}
          {screen === "bespoke" && (
            <div className="space-y-4">
              <div className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground pb-2 border-b border-border">
                {t("bespoke")} — In.Lab
              </div>
              <ul className="space-y-1 text-xs">
                <li>
                  <SheetClose asChild>
                    <Link
                      href="/shop/ma-creme-jour"
                      className="flex min-h-[44px] items-center justify-between px-2 text-foreground/90 hover:text-ioma-violet"
                    >
                      <span>Ma Crème Jour (30ml / 50ml)</span>
                      <span className="text-[0.7rem] text-muted-foreground">559 AED</span>
                    </Link>
                  </SheetClose>
                </li>
                <li>
                  <SheetClose asChild>
                    <Link
                      href="/shop/ma-creme-nuit"
                      className="flex min-h-[44px] items-center justify-between px-2 text-foreground/90 hover:text-ioma-violet"
                    >
                      <span>Ma Crème Nuit (30ml / 50ml)</span>
                      <span className="text-[0.7rem] text-muted-foreground">559 AED</span>
                    </Link>
                  </SheetClose>
                </li>
                <li>
                  <SheetClose asChild>
                    <Link
                      href="/shop/mon-serum"
                      className="flex min-h-[44px] items-center justify-between px-2 text-foreground/90 hover:text-ioma-violet"
                    >
                      <span>Mon Sérum (30ml)</span>
                      <span className="text-[0.7rem] text-muted-foreground">873 AED</span>
                    </Link>
                  </SheetClose>
                </li>
                <li>
                  <SheetClose asChild>
                    <Link
                      href="/shop/mon-soin-yeux"
                      className="flex min-h-[44px] items-center justify-between px-2 text-foreground/90 hover:text-ioma-violet"
                    >
                      <span>Mon Soin Yeux (30ml)</span>
                      <span className="text-[0.7rem] text-muted-foreground">508 AED</span>
                    </Link>
                  </SheetClose>
                </li>
              </ul>
              <div className="pt-4 border-t border-border">
                <SheetClose asChild>
                  <Link
                    href="/diagnosis"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-ioma-violet px-4 text-xs uppercase tracking-widest font-semibold text-white"
                  >
                    <Sparkles className="size-3.5" />
                    <span>{t("startDiagnosisCta")}</span>
                  </Link>
                </SheetClose>
              </div>
            </div>
          )}

          {/* VISAGE SUBMENU */}
          {screen === "visage" && (
            <div className="space-y-6">
              {/* Gammes */}
              <div>
                <div className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground pb-2 border-b border-border mb-2">
                  {t("rangesTitle")} (1 - 7)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    {
                      key: "hydra",
                      num: "1",
                      name: "Hydra",
                      color: PRODUCT_RANGE_COLORS.hydra,
                    },
                    {
                      key: "energize",
                      num: "2",
                      name: "Energize",
                      color: PRODUCT_RANGE_COLORS.energize,
                    },
                    {
                      key: "renew",
                      num: "3",
                      name: "Renew",
                      color: PRODUCT_RANGE_COLORS.renew,
                    },
                    {
                      key: "calm",
                      num: "4",
                      name: "Calm",
                      color: PRODUCT_RANGE_COLORS.calm,
                    },
                    {
                      key: "purete",
                      num: "5",
                      name: "Pureté",
                      color: PRODUCT_RANGE_COLORS.purete,
                    },
                    {
                      key: "matte",
                      num: "6",
                      name: "Matte",
                      color: PRODUCT_RANGE_COLORS.matte,
                    },
                    {
                      key: "illumine",
                      num: "7",
                      name: "Illumine",
                      color: PRODUCT_RANGE_COLORS.illumine,
                    },
                  ].map((r) => (
                    <SheetClose asChild key={r.key}>
                      <Link
                        href={`/shop?range=${r.key}`}
                        className="flex min-h-[40px] items-center gap-2 px-2 rounded-sm border border-border/50 text-xs text-foreground/80 hover:text-foreground hover:bg-muted"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        <span>
                          {r.num} {r.name}
                        </span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              {/* Catégories */}
              <div>
                <div className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground pb-2 border-b border-border mb-2">
                  {t("categoriesTitle")}
                </div>
                <ul className="space-y-1 text-xs">
                  {[
                    { label: "Sérums", href: "/shop?category=serums" },
                    { label: "Crèmes", href: "/shop?category=cremes" },
                    { label: "Nettoyants & Lotions", href: "/shop?category=nettoyants" },
                    { label: "Démaquillants", href: "/shop?category=demaquillants" },
                    { label: "Masques & Gommages", href: "/shop?category=masques" },
                    { label: "Yeux & Lèvres", href: "/shop?category=soins-yeux-levres" },
                    {
                      label: "Protection Solaire",
                      href: "/shop?category=protection-solaire",
                    },
                  ].map((cat) => (
                    <li key={cat.href}>
                      <SheetClose asChild>
                        <Link
                          href={cat.href}
                          className="flex min-h-[40px] items-center px-2 text-foreground/80 hover:text-foreground"
                        >
                          {cat.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View All */}
              <div className="pt-2">
                <SheetClose asChild>
                  <Link
                    href="/shop"
                    className="flex min-h-[44px] items-center justify-center rounded-sm bg-muted text-xs uppercase tracking-widest font-medium text-foreground hover:bg-muted/80"
                  >
                    {t("allFace")}
                  </Link>
                </SheetClose>
              </div>
            </div>
          )}

          {/* INSIDE IOMA SUBMENU */}
          {screen === "inside" && (
            <div className="space-y-2 text-xs">
              {[
                { label: t("maison"), href: "/maison" },
                { label: t("technology"), href: "/technology" },
                { label: t("journal"), href: "/journal" },
                { label: t("partners"), href: "/partners" },
                { label: t("professionals"), href: "/professionals" },
                { label: t("bookAppointment"), href: "/booking" },
              ].map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[44px] items-center justify-between border-b border-border/40 px-2 text-foreground/80 hover:text-foreground"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
                  </Link>
                </SheetClose>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
