"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  FileText,
  GraduationCap,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/portal", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/portal/catalog", labelKey: "catalog", icon: ShoppingBag },
  { href: "/portal/orders", labelKey: "orders", icon: ClipboardList },
  { href: "/portal/trainings", labelKey: "trainings", icon: GraduationCap },
  { href: "/portal/protocols", labelKey: "protocols", icon: BookOpen },
] as const;

export default function ProLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Pro");
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthHydrated();

  const isApproved =
    user?.roles.includes("professional_approved") ||
    user?.roles.includes("administrator") ||
    user?.roles.includes("super_administrator");
  const isPending = user?.roles.includes("professional_pending");

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, router, user]);

  if (!hydrated) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[1440px] px-4 md:px-6 py-24">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (!user) return null;

  // Pending: show application status
  if (isPending) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[800px] px-4 md:px-6 py-24">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 font-heading text-3xl font-light text-ioma-black">
            {t("pending.title")}
          </h1>
          <p className="mt-4 text-ioma-grey-500">{t("pending.description")}</p>
          <Link
            href="/professionals/apply"
            className="mt-8 inline-block rounded bg-ioma-black px-6 py-3 text-sm font-medium text-white hover:bg-ioma-black/90"
          >
            {t("pending.viewApplication")}
          </Link>
        </div>
      </main>
    );
  }

  // Not a professional at all
  if (!isApproved && !isPending) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[800px] px-4 md:px-6 py-24">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-light text-ioma-black">
            {t("accessDenied.title")}
          </h1>
          <p className="mt-4 text-ioma-grey-500">{t("accessDenied.description")}</p>
          <Link
            href="/professionals"
            className="mt-8 inline-block rounded bg-ioma-black px-6 py-3 text-sm font-medium text-white hover:bg-ioma-black/90"
          >
            {t("accessDenied.learnMore")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Professional portal sidebar */}
        <nav aria-label={t("nav.label")} className="space-y-1">
          <h2 className="mb-4 font-heading text-sm font-medium uppercase tracking-wider text-ioma-grey-400">
            {t("nav.portal")}
          </h2>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/portal"
                ? pathname === `/${user.locale}/portal` || pathname.endsWith("/portal")
                : pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ioma-black text-white"
                    : "text-ioma-grey-600 hover:bg-ioma-grey-50 hover:text-ioma-black",
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(`nav.${item.labelKey}`)}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
