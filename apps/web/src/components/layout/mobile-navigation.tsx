"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
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

const NOT_YET_BUILT = new Set(["/diagnosis", "/booking", "/partners"]);

export function MobileNavigation() {
  const t = useTranslations("Nav");
  const locale = useLocale();
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
    <Sheet>
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
        className="data-[side=left]:w-full data-[side=right]:w-full max-w-sm"
        showCloseButton={false}
        data-testid="mobile-nav"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{t("primaryNavigation")}</SheetTitle>
        </SheetHeader>
        <nav
          aria-label={t("primaryNavigation")}
          className="flex flex-1 flex-col px-4 py-2"
        >
          {primaryLinks.map((link, idx) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                prefetch={NOT_YET_BUILT.has(link.href) ? false : undefined}
                className="flex min-h-11 items-center border-b border-border text-sm uppercase tracking-widest text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  transitionDelay: `${idx * 25}ms`,
                }}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link
              href="/booking"
              prefetch={false}
              className="mt-6 flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 text-sm uppercase tracking-widest text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("bookAppointment")}
            </Link>
          </SheetClose>
        </nav>
        <div className="border-t border-border p-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              {t("closeMenu")}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
