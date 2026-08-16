"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { useProductQuery } from "@/hooks/use-catalog-queries";
import { useAddCartItem } from "@/hooks/use-cart";
import {
  useAddWishlistItem,
  useRemoveWishlistItem,
  useWishlistQuery,
  isUnauthorized,
} from "@/hooks/use-wishlist";
import { useCartDrawerStore } from "@/stores/cart-drawer-store";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatMinor } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations("Product");
  const locale = useLocale() as Locale;

  const { data: product, isLoading, isError } = useProductQuery(slug);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const addCartItem = useAddCartItem();
  const openCartDrawer = useCartDrawerStore((s) => s.open);
  const wishlist = useWishlistQuery();
  const addWishlistItem = useAddWishlistItem();
  const removeWishlistItem = useRemoveWishlistItem();

  useEffect(() => {
    if (product && !selectedSku && product.variants[0]) {
      setSelectedSku(product.variants[0].sku);
    }
  }, [product, selectedSku]);

  if (isError) notFound();
  if (isLoading || !product) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2" aria-busy="true">
          <div className="aspect-square animate-pulse rounded-md bg-ioma-grey-100" />
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-ioma-grey-100" />
            <div className="h-8 w-64 animate-pulse rounded bg-ioma-grey-100" />
          </div>
        </div>
      </main>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.sku === selectedSku) ?? product.variants[0];
  const isWishlisted =
    wishlist.data?.some((item) => item.sku === selectedVariant?.sku) ?? false;

  function toggleWishlist() {
    if (!selectedVariant) return;
    if (isWishlisted) removeWishlistItem.mutate(selectedVariant.sku);
    else addWishlistItem.mutate(selectedVariant.sku);
  }

  function handleAddToCart() {
    if (!selectedVariant) return;
    addCartItem.mutate(
      { sku: selectedVariant.sku, qty: 1 },
      { onSuccess: () => openCartDrawer() },
    );
  }

  const currentImage = product.images[activeImageIndex] ?? product.images[0];

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16" data-testid="pdp-layout">
        {/* Product Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-md bg-ioma-grey-100">
            {currentImage ? (
              <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="relative size-full"
              >
                <Image
                  src={currentImage}
                  alt={product.name[locale]}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </motion.div>
            ) : null}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-sm border transition-all",
                    activeImageIndex === idx
                      ? "border-ioma-black ring-1 ring-ioma-black"
                      : "border-border opacity-70 hover:opacity-100",
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-xs uppercase tracking-heading text-muted-foreground">
            {product.range.name[locale]}
          </p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">
            {product.name[locale]}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {product.shortBenefit[locale]}
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest text-foreground/80">
            {t(`routineStep.${product.routineStep}`)}
          </p>

          {product.variants.length > 1 ? (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {t("sizeLabel")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.sku}
                    type="button"
                    onClick={() => setSelectedSku(variant.sku)}
                    aria-pressed={selectedVariant?.sku === variant.sku}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-all duration-150",
                      selectedVariant?.sku === variant.sku
                        ? "border-foreground bg-foreground text-background shadow-xs scale-102"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {selectedVariant ? (
            <p className="mt-6 text-lg font-medium">
              {formatMinor(selectedVariant.priceMinor, locale)}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              data-testid="add-to-cart"
              className="uppercase tracking-widest transition-transform active:scale-98"
              disabled={!selectedVariant?.inStock || addCartItem.isPending}
              onClick={handleAddToCart}
            >
              {selectedVariant?.inStock ? t("addToCart") : t("outOfStock")}
            </Button>
            <Button
              variant="outline"
              size="icon"
              data-testid="wishlist-toggle"
              aria-label={isWishlisted ? t("wishlistRemove") : t("wishlistAdd")}
              aria-pressed={isWishlisted}
              disabled={addWishlistItem.isPending || removeWishlistItem.isPending}
              onClick={toggleWishlist}
              title={
                isUnauthorized(wishlist.error) ? t("wishlistSignInRequired") : undefined
              }
            >
              <HeartIcon filled={isWishlisted} />
            </Button>
          </div>
          {isUnauthorized(wishlist.error) ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("wishlistSignInRequired")}
            </p>
          ) : null}

          {/* Collapsible Accordion Sections */}
          <Accordion
            type="single"
            collapsible
            defaultValue="how-to-use"
            className="mt-12 border-t border-border"
          >
            <AccordionItem value="how-to-use">
              <AccordionTrigger className="uppercase tracking-widest text-xs">
                {t("howToUseTitle")}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/90">
                {product.howToUse[locale]}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ingredients">
              <AccordionTrigger className="uppercase tracking-widest text-xs">
                {t("ingredientsTitle")}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/90">
                {product.fullIngredientsText[locale]}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="mt-16 max-w-2xl border-t border-border pt-8">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description[locale]}
        </p>
      </div>
    </main>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <motion.svg
      key={filled ? "filled" : "outline"}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
      viewBox="0 0 24 24"
      className="size-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8 1.9 4.5 5.3 4c2-.3 3.9.7 5.2 2.4C11.7 4.7 13.6 3.7 15.6 4c3.4.5 4.9 4 3.3 7.7-2.5 4.7-10 9.3-10 9.3z" />
    </motion.svg>
  );
}
