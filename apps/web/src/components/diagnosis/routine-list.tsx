import type { Locale } from "@ioma/config";
import type { RoutineVariant } from "@ioma/types";
import { formatMinor } from "@/lib/money";

// Shared by both diagnosis result pages (standard + AI) — the two flows
// must never present a routine differently, since a customer may take both
// and compare.
export function dedupeVariantsBySku(variants: RoutineVariant[]): RoutineVariant[] {
  const seen = new Set<string>();
  return variants.filter((v) => (seen.has(v.sku) ? false : (seen.add(v.sku), true)));
}

export function RoutineList({
  title,
  variants,
  emptyMessage,
  locale,
}: {
  title: string;
  variants: RoutineVariant[];
  emptyMessage: string;
  locale: Locale;
}) {
  return (
    <div>
      <h2 className="font-display text-xl">{title}</h2>
      {variants.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {variants.map((variant) => (
            <li
              key={variant.sku}
              className="flex items-center justify-between border-b border-border pb-3 text-sm"
            >
              <span>
                {variant.name[locale]} · {variant.size}
              </span>
              <span className="text-muted-foreground">
                {formatMinor(variant.priceMinor, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
