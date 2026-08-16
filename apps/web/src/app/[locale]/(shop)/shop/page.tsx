"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@ioma/config";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  useProductsQuery,
  useRangesQuery,
  useConcernsQuery,
} from "@/hooks/use-catalog-queries";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const t = useTranslations("Shop");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const range = searchParams.get("range") ?? undefined;
  const concern = searchParams.get("concern") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const { data: ranges } = useRangesQuery();
  const { data: concerns } = useConcernsQuery();
  const { data: products, isLoading, isError } = useProductsQuery({ range, concern, q });

  function setFilter(key: "range" | "concern", value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <p className="text-xs uppercase tracking-heading text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl">{t("title")}</h1>

      <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-border pb-8">
        <FilterPill
          active={!range}
          label={t("allRanges")}
          onClick={() => setFilter("range", undefined)}
        />
        {ranges?.map((r) => (
          <FilterPill
            key={r.slug}
            active={range === r.slug}
            label={r.name[locale]}
            onClick={() => setFilter("range", r.slug)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 pb-8">
        <FilterPill
          active={!concern}
          label={t("allConcerns")}
          onClick={() => setFilter("concern", undefined)}
        />
        {concerns?.map((c) => (
          <FilterPill
            key={c.slug}
            active={concern === c.slug}
            label={c.name[locale]}
            onClick={() => setFilter("concern", c.slug)}
          />
        ))}
      </div>

      {isLoading ? (
        <div
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-md bg-ioma-grey-100" />
              <div className="mt-4 h-3 w-16 rounded bg-ioma-grey-100" />
              <div className="mt-2 h-4 w-32 rounded bg-ioma-grey-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="mt-16 text-sm text-destructive">{t("noResults")}</p>
      ) : products && products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-sm text-muted-foreground">{t("noResults")}</p>
      )}
    </main>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
