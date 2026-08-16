"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { useB2BOrders } from "@/hooks/use-professional";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, ShoppingBag, TrendingUp } from "lucide-react";

export default function PortalDashboardPage() {
  const t = useTranslations("Pro.dashboard");
  const user = useAuthStore((s) => s.user);
  const { data: orders, isLoading } = useB2BOrders();

  const totalOrders = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + o.totalMinor, 0) ?? 0;

  return (
    <div>
      <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
        {t("title", { name: user?.email ?? "" })}
      </h1>
      <p className="mt-2 text-ioma-grey-500">{t("subtitle")}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ioma-grey-500">
              {t("stats.totalOrders")}
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-ioma-grey-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-ioma-black">
              {isLoading ? "—" : totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ioma-grey-500">
              {t("stats.totalSpent")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-ioma-grey-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-ioma-black">
              {isLoading ? "—" : `${(totalSpent / 100).toLocaleString()} AED`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ioma-grey-500">
              {t("stats.catalog")}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-ioma-grey-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light text-ioma-black">
              {t("stats.browseCTA")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <div className="mt-12">
        <h2 className="font-heading text-xl font-light text-ioma-black">
          {t("recentOrders")}
        </h2>
        {isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-ioma-grey-100" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between rounded-lg border border-ioma-grey-100 p-4"
              >
                <div>
                  <p className="font-medium text-ioma-black">{order.orderNumber}</p>
                  <p className="text-sm text-ioma-grey-500">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ioma-black">
                    {(order.totalMinor / 100).toLocaleString()} AED
                  </p>
                  <p className="text-sm capitalize text-ioma-grey-500">
                    {order.fulfillmentStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-ioma-grey-500">{t("noOrders")}</p>
        )}
      </div>
    </div>
  );
}
