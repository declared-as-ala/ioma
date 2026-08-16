"use client";

import { ArrowRight, Heart, KeyRound, MapPin, Package, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProfileQuery } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { href: "/account/profile", key: "profile", icon: UserRound },
  { href: "/account/addresses", key: "addresses", icon: MapPin },
  { href: "/account/orders", key: "orders", icon: Package },
  { href: "/wishlist", key: "wishlist", icon: Heart },
  { href: "/account/security", key: "security", icon: KeyRound },
] as const;

export default function AccountDashboardPage() {
  const t = useTranslations("Account");
  const profile = useProfileQuery();

  return (
    <section aria-labelledby="account-dashboard-title">
      <p className="text-xs uppercase tracking-heading text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 id="account-dashboard-title" className="mt-4 font-display text-3xl">
        {t("dashboard.title")}
      </h1>

      {profile.isLoading ? (
        <div className="mt-4 h-6 w-64 animate-pulse bg-ioma-grey-100" aria-busy="true" />
      ) : profile.isError ? (
        <div className="mt-6" role="alert">
          <p className="text-sm text-destructive">{t("loadError")}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => profile.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-lg text-muted-foreground">
          {t("dashboard.welcomeBack", { firstName: profile.data?.firstName ?? "" })}
        </p>
      )}

      <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2">
        {quickLinks.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex min-h-32 items-start justify-between gap-6 bg-background p-6 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex items-center gap-3">
              <Icon className="size-5" aria-hidden="true" />
              <span className="font-medium">{t(`nav.${key}`)}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
