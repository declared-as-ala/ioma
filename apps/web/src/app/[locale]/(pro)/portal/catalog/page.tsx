"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useB2BCatalog, useAddToCartB2BMutation } from "@/hooks/use-professional";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CatalogPage() {
  const t = useTranslations("Pro.catalog");
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useB2BCatalog({ q: search || undefined });
  const addToCart = useAddToCartB2BMutation();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleAddToCart = async (sku: string, moq: number | null) => {
    const qty = quantities[sku] ?? moq ?? 1;
    if (moq && qty < moq) {
      toast.error(t("errors.moq", { moq }));
      return;
    }
    try {
      await addToCart.mutateAsync({ sku, qty });
      toast.success(t("success.added"));
    } catch {
      toast.error(t("errors.failed"));
    }
  };

  const updateQty = (sku: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.max(1, (prev[sku] ?? 1) + delta),
    }));
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-ioma-grey-500">{t("subtitle")}</p>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ioma-grey-400" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-ioma-grey-100" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.slug} className="overflow-hidden">
              <div className="aspect-square bg-ioma-grey-50">
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name.en}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-heading text-lg font-light text-ioma-black">
                  {product.name.en}
                </h3>
                <p className="mt-1 text-sm text-ioma-grey-500">{product.range.name.en}</p>
                {product.priceFromMinor !== null && (
                  <p className="mt-2 text-lg font-medium text-ioma-black">
                    {(product.priceFromMinor / 100).toLocaleString()} AED
                  </p>
                )}
                <div className="mt-3 space-y-2">
                  {product.variants.map(
                    (variant: {
                      sku: string;
                      size: string;
                      b2bPriceMinor: number | null;
                      moq: number | null;
                      inStock: boolean;
                    }) => (
                      <div
                        key={variant.sku}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-ioma-grey-600">{variant.size}</span>
                          {!variant.inStock && (
                            <Badge variant="outline" className="text-xs">
                              {t("outOfStock")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {variant.moq && (
                            <span className="text-xs text-ioma-grey-400">
                              MOQ: {variant.moq}
                            </span>
                          )}
                          {variant.b2bPriceMinor && (
                            <span className="font-medium">
                              {(variant.b2bPriceMinor / 100).toLocaleString()} AED
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center rounded border border-ioma-grey-200">
                    <button
                      onClick={() => updateQty(product.variants[0]?.sku ?? "", -1)}
                      className="px-2 py-1 text-ioma-grey-500 hover:text-ioma-black"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm">
                      {quantities[product.variants[0]?.sku ?? ""] ??
                        product.variants[0]?.moq ??
                        1}
                    </span>
                    <button
                      onClick={() => updateQty(product.variants[0]?.sku ?? "", 1)}
                      className="px-2 py-1 text-ioma-grey-500 hover:text-ioma-black"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handleAddToCart(
                        product.variants[0]?.sku ?? "",
                        product.variants[0]?.moq ?? null,
                      )
                    }
                    disabled={!product.variants[0]?.inStock || addToCart.isPending}
                  >
                    <ShoppingBag className="mr-2 h-3 w-3" />
                    {addToCart.isPending ? t("adding") : t("addToCart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-ioma-grey-500">{t("noProducts")}</p>
        </div>
      )}
    </div>
  );
}
