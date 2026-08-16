"use client";

import { use, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { useOrderQuery, useRetryPaymentMutation } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { formatMinor } from "@/lib/money";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const t = useTranslations("Checkout");
  const locale = useLocale() as Locale;

  const { data: order, isLoading, refetch } = useOrderQuery(orderNumber, token);
  const retryPayment = useRetryPaymentMutation(orderNumber, token);
  const [lastRetryFailed, setLastRetryFailed] = useState(false);

  if (isLoading || !order) {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24 text-center" aria-busy="true">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-ioma-grey-100" />
      </main>
    );
  }

  const isPaid = order.paymentStatus === "paid";

  function handleRetry(paymentMethod: "mock_success" | "mock_failure") {
    retryPayment.mutate(paymentMethod, {
      onSuccess: (updated) => {
        setLastRetryFailed(updated.paymentStatus !== "paid");
        refetch();
      },
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24 text-center">
      {isPaid ? (
        <>
          <h1 className="font-display text-3xl">{t("confirmationTitle")}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("confirmationBody", { orderNumber: order.orderNumber })}
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl">{t("orderFailedTitle")}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("orderFailedBody", { orderNumber: order.orderNumber })}
          </p>
          {lastRetryFailed ? (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {t("orderFailedTitle")}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              disabled={retryPayment.isPending}
              onClick={() => handleRetry("mock_success")}
              className="uppercase tracking-widest"
            >
              {t("retryPayment")}
            </Button>
          </div>
        </>
      )}

      <div className="mt-12 rounded-md border border-border p-6 text-start">
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.sku} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.productNameSnapshot[locale]} × {item.qty}
              </span>
              <span>{formatMinor(item.totalMinor, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("summarySubtotal")}</span>
            <span>{formatMinor(order.subtotalMinor, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("summaryTax")}</span>
            <span>{formatMinor(order.taxMinor, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("summaryShipping")}</span>
            <span>{formatMinor(order.shippingMinor, locale)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{t("summaryTotal")}</span>
            <span>{formatMinor(order.totalMinor, locale)}</span>
          </div>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/shop">{t("backToShop")}</Link>
      </Button>
    </main>
  );
}
