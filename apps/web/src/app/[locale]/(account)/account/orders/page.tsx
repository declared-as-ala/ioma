"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { useOrdersQuery } from "@/hooks/use-orders";
import { formatMinor } from "@/lib/money";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const t = useTranslations("Account");
  const locale = useLocale() as Locale;
  const orders = useOrdersQuery();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <section aria-labelledby="orders-title">
      <h1 id="orders-title" className="font-display text-3xl">
        {t("orders.title")}
      </h1>

      {orders.isLoading ? (
        <div className="mt-8 space-y-3" aria-busy="true">
          <div className="h-36 animate-pulse bg-ioma-grey-100" />
          <div className="h-36 animate-pulse bg-ioma-grey-100" />
        </div>
      ) : orders.isError ? (
        <div className="mt-8" role="alert">
          <p className="text-sm text-destructive">{t("loadError")}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => orders.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : orders.data?.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
          <Button asChild className="mt-5">
            <Link href="/shop">{t("orders.browseShop")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {orders.data?.map((order) => (
            <li key={order.orderNumber} className="py-7">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <h2 className="font-medium">
                    {t("orders.orderNumber")} {order.orderNumber}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("orders.placedOn", {
                      date: dateFormatter.format(new Date(order.createdAt)),
                    })}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t("orders.total")}
                  </p>
                  <p className="mt-1 font-medium tabular-nums">
                    {formatMinor(order.totalMinor, locale)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 border-t border-border pt-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t("orders.tracking")}
                  </h3>
                  <ol className="mt-3 space-y-2">
                    {order.statusHistory.map((entry, index) => (
                      <li
                        key={`${entry.status}-${entry.at}-${index}`}
                        className="flex items-baseline gap-3 text-sm"
                      >
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-foreground"
                          aria-hidden="true"
                        />
                        <span>{t(`orders.status.${entry.status}`)}</span>
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={entry.at}
                        >
                          {dateFormatter.format(new Date(entry.at))}
                        </time>
                      </li>
                    ))}
                  </ol>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/checkout/confirmation/${order.orderNumber}`}>
                    {t("orders.viewDetails")}
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
