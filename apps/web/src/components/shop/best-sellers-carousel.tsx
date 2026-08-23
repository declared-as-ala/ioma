"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { useProductsQuery } from "@/hooks/use-catalog-queries";
import { formatMinor } from "@/lib/money";
import { Link } from "@/i18n/navigation";
import { useAddCartItem } from "@/hooks/use-cart";
import { useCartDrawerStore } from "@/stores/cart-drawer-store";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

export function BestSellersCarousel() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Shop");
  const { data: allProducts, isLoading } = useProductsQuery({});
  const addCartItem = useAddCartItem();
  const openCartDrawer = useCartDrawerStore((s) => s.open);

  // Filter bestsellers or fallback to first items
  const bestSellers = allProducts
    ? allProducts.filter((p) => p.isBestSeller).slice(0, 8)
    : [];

  const displayProducts =
    bestSellers.length >= 4 ? bestSellers : allProducts?.slice(0, 8) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-[3/4] bg-muted rounded-sm" />
            <div className="h-4 bg-muted w-2/3 rounded" />
            <div className="h-4 bg-muted w-1/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {displayProducts.map((product) => {
          const firstVariant = product.variants?.[0];
          const hasMultipleSizes = (product.variants?.length || 0) > 1;

          const handleQuickAdd = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (firstVariant) {
              addCartItem.mutate(
                { sku: firstVariant.sku, qty: 1 },
                { onSuccess: () => openCartDrawer() },
              );
            }
          };

          return (
            <div
              key={product.slug}
              className="group flex flex-col justify-between rounded-sm border border-border/60 bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-ioma-violet/40"
            >
              <Link href={`/shop/${product.slug}`} className="flex flex-col flex-1">
                {/* Image Box */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-white p-4">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name[locale]}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      IOMA Paris
                    </div>
                  )}

                  {/* Best seller badge */}
                  <span className="absolute top-2 start-2 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-background backdrop-blur-sm">
                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                    Best-Seller
                  </span>
                </div>

                {/* Info */}
                <div className="mt-4 flex flex-col flex-1">
                  <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.range.name[locale]}
                  </span>
                  <h3 className="mt-1 font-display text-base font-medium text-foreground group-hover:text-ioma-violet transition-colors line-clamp-1">
                    {product.name[locale]}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.shortBenefit[locale]}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    {product.priceFromMinor !== null ? (
                      <span className="text-sm font-semibold text-foreground">
                        {hasMultipleSizes ? `Dès ` : ""}
                        {formatMinor(product.priceFromMinor, locale)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Prix sur mesure
                      </span>
                    )}

                    <span className="text-[0.7rem] text-muted-foreground">
                      {firstVariant?.size}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action */}
              <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                <Button
                  onClick={handleQuickAdd}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs uppercase tracking-wider font-medium hover:bg-ioma-violet hover:text-white hover:border-ioma-violet transition-all"
                >
                  {t("addToBag")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="uppercase tracking-widest font-semibold"
        >
          <Link href="/shop?bestSeller=true" className="inline-flex items-center gap-2">
            <span>Découvrir toutes les meilleures ventes</span>
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
