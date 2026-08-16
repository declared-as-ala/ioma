"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import type { ProductListItem } from "@ioma/types";
import { Link } from "@/i18n/navigation";
import { formatMinor } from "@/lib/money";

export function ProductCard({ product }: { product: ProductListItem }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Shop");

  return (
    <Link href={`/shop/${product.slug}`} prefetch={false} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-ioma-grey-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name[locale]}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
          />
        ) : null}
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {product.range.name[locale]}
      </p>
      <p className="mt-1 font-display text-lg">{product.name[locale]}</p>
      <p className="mt-1 text-sm text-muted-foreground">{product.shortBenefit[locale]}</p>
      {product.priceFromMinor !== null ? (
        <p className="mt-2 text-sm">
          {t("priceFrom", { price: formatMinor(product.priceFromMinor, locale) })}
        </p>
      ) : null}
    </Link>
  );
}
