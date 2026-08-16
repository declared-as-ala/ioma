"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/professionals", label: "B2B Approvals", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/partners", label: "Partner Clinics", icon: MapPin },
  { href: "/admin/audit", label: "Audit Logs", icon: ShieldAlert },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ioma-black text-white p-6 min-h-[calc(100vh-4rem)] rounded-xl flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="flex items-center gap-2 border-b border-ioma-grey-800 pb-4">
          <Sparkles className="h-5 w-5 text-ioma-gold" />
          <span className="font-heading text-lg font-light tracking-wide uppercase">
            IOMA Admin
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname.endsWith("/admin")
                : pathname.includes(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-ioma-grey-400 hover:text-white hover:bg-white/5",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-ioma-gold" : "text-ioma-grey-400",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-ioma-grey-800 pt-4 text-xs text-ioma-grey-500">
        <p>IOMA Paris Dubai Platform</p>
        <p className="mt-1">v1.0.0 — Production Admin</p>
      </div>
    </aside>
  );
}
