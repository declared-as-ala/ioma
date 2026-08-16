"use client";

import { useTranslations } from "next-intl";
import { useB2BOrders } from "@/hooks/use-professional";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  const t = useTranslations("Pro.orders");
  const { data: orders, isLoading } = useB2BOrders();

  return (
    <div>
      <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-ioma-grey-500">{t("subtitle")}</p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-ioma-grey-100" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-light">{order.orderNumber}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={STATUS_COLORS[order.paymentStatus] ?? ""}>
                    {order.paymentStatus}
                  </Badge>
                  <Badge className={STATUS_COLORS[order.fulfillmentStatus] ?? ""}>
                    {order.fulfillmentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ioma-grey-500">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}{" "}
                      &middot; {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 space-y-1">
                      {order.items.map(
                        (
                          item: { productNameSnapshot: { en: string }; qty: number },
                          i: number,
                        ) => (
                          <p key={i} className="text-sm text-ioma-grey-600">
                            {item.productNameSnapshot.en} &times; {item.qty}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-ioma-black">
                      {(order.totalMinor / 100).toLocaleString()} AED
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-ioma-grey-300" />
          <p className="mt-4 text-ioma-grey-500">{t("noOrders")}</p>
          <Link href="/portal/catalog">
            <Button className="mt-4">{t("browseCatalog")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
