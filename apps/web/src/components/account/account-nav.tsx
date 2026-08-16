"use client";

import {
  Calendar,
  Heart,
  House,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/account", key: "dashboard", icon: House },
  { href: "/account/profile", key: "profile", icon: UserRound },
  { href: "/account/addresses", key: "addresses", icon: MapPin },
  { href: "/account/orders", key: "orders", icon: Package },
  { href: "/account/appointments", key: "appointments", icon: Calendar },
  { href: "/wishlist", key: "wishlist", icon: Heart },
  { href: "/diagnosis/history", key: "diagnosis", icon: Sparkles },
  { href: "/account/security", key: "security", icon: KeyRound },
] as const;

export function AccountNav() {
  const t = useTranslations("Account.nav");
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  return (
    <nav
      aria-label={t("accountNavigation")}
      className="lg:sticky lg:top-48 lg:self-start"
    >
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:flex lg:flex-col">
        {links.map(({ href, key, icon: Icon }) => {
          const active =
            href === "/account" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 border-b border-border px-3 py-2 text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active && "border-foreground bg-accent font-medium",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 space-y-2 border-t border-border pt-4">
        <Link
          href="/account/delete"
          className={cn(
            "flex min-h-11 items-center gap-3 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            pathname === "/account/delete" && "bg-destructive/5 font-medium",
          )}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t("deleteAccount")}
        </Link>
        <Button
          type="button"
          variant="ghost"
          disabled={logout.isPending}
          className="min-h-11 w-full justify-start gap-3 px-3"
          onClick={() =>
            logout.mutate(undefined, { onSettled: () => router.replace("/login") })
          }
        >
          <LogOut className="size-4" aria-hidden="true" />
          {logout.isPending ? t("loggingOut") : t("logout")}
        </Button>
      </div>
    </nav>
  );
}
