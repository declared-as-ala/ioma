"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

export function AccountLink() {
  const t = useTranslations("Nav");
  const isLoggedIn = useAuthStore((s) => Boolean(s.user));

  return (
    <Button asChild variant="ghost" size="icon-sm" aria-label={t("account")}>
      <Link href={isLoggedIn ? "/account" : "/login"}>
        <User className="size-4" />
      </Link>
    </Button>
  );
}
