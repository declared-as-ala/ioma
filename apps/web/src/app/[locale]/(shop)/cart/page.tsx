"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { useCartQuery, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMinor } from "@/lib/money";

export default function CartPage() {
  const t = useTranslations("Cart");
  const locale = useLocale() as Locale;
  const { data: cart, isLoading } = useCartQuery();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <h1 className="font-display text-4xl">{t("title")}</h1>

      {isLoading ? (
        <div className="mt-10 space-y-4" aria-busy="true">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-md bg-ioma-grey-100" />
          ))}
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t("emptyBody")}</p>
          <Button asChild className="mt-2 uppercase tracking-widest">
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-border border-y border-border">
            {cart.items.map((item) => (
              <li
                key={item.sku}
                className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-6 md:grid-cols-[112px_minmax(0,1fr)_auto] md:gap-6"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-ioma-grey-100 md:size-28">
                  {item.product?.images[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name[locale]}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                  <div>
                    <p className="font-display text-lg">{item.product?.name[locale]}</p>
                    <p className="text-sm text-muted-foreground">{item.size}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <label className="flex flex-wrap items-center gap-2 text-sm">
                      {t("quantity")}
                      <Input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          if (qty >= 1) updateItem.mutate({ sku: item.sku, qty });
                        }}
                        className="w-16"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.sku)}
                      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
                <p className="col-start-2 text-sm md:col-start-3">
                  {formatMinor(item.lineTotalMinor, locale)}
                </p>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-md border border-border p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span>{formatMinor(cart.subtotalMinor, locale)}</span>
            </div>
            <Button asChild className="mt-6 w-full uppercase tracking-widest">
              <Link href="/checkout" data-testid="cart-page-checkout">
                {t("checkout")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
