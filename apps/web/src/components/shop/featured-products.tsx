"use client";

import { useTranslations } from "next-intl";
import { useProductsQuery } from "@/hooks/use-catalog-queries";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CtaArrow } from "@/components/ui/cta-arrow";

const FEATURED_COUNT = 4;

// Homepage's Featured Products section — deliberately omitted in Sprint 3
// (no real catalog existed yet, see CLAUDE.md "Rules Against Placeholders")
// and built here in Sprint 4 now that /products is real. No "featured" flag
// exists in the Product schema yet, so this honestly shows the first N
// published products rather than implying editorial curation that doesn't
// exist — see DECISIONS.md.
export function FeaturedProducts() {
  const t = useTranslations("Home.ranges");
  const { data: products, isLoading } = useProductsQuery({});

  if (isLoading) {
    return (
      <div
        className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6"
        aria-busy="true"
      >
        {Array.from({ length: FEATURED_COUNT }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] rounded-md bg-ioma-grey-100" />
            <div className="mt-4 h-3 w-16 rounded bg-ioma-grey-100" />
            <div className="mt-2 h-4 w-32 rounded bg-ioma-grey-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
      {products.slice(0, FEATURED_COUNT).map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
      <Button
        asChild
        variant="link"
        className="col-span-2 w-fit px-0 uppercase tracking-widest md:col-span-4"
      >
        <Link href="/shop" className="inline-flex items-center gap-1.5">
          {t("cta")} <CtaArrow />
        </Link>
      </Button>
    </div>
  );
}
