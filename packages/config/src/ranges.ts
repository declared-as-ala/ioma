// Source of truth: IOMA_CHARTE_GRAPHIQUE_2026_FR.pdf, "Les couleurs de la gamme" (p.15)
// Do not add a range here without a corresponding charter reference in DESIGN_SYSTEM.md.
export type ProductRangeKey =
  | "hydra"
  | "energize"
  | "renew"
  | "calm"
  | "purete"
  | "matte"
  | "illumine"
  | "inlab"
  | "coco"
  | "hair";

export const PRODUCT_RANGE_COLORS: Record<ProductRangeKey, string> = {
  hydra: "#00639A",
  energize: "#E56953",
  renew: "#782285",
  calm: "#B52655",
  purete: "#B89E16",
  matte: "#00677F",
  illumine: "#483A8F",
  inlab: "#AA9FEB",
  coco: "#8D7B68",
  hair: "#2C5E7A",
};
