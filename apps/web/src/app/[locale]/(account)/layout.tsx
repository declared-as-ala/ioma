"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthHydrated();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return (
      <main
        className="mx-auto min-h-[50vh] max-w-[1440px] px-4 md:px-6 py-24"
        aria-busy="true"
      >
        <span className="sr-only">{t("loading")}</span>
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-40 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
