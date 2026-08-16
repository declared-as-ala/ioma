import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import type { ProductRangeKey } from "@ioma/config";

export type ProductRangeDocument = HydratedDocument<ProductRange>;

// See DATA_MODEL.md "ProductRange". `slug` mirrors @ioma/config's
// ProductRangeKey — the 7 ranges are fixed by the charter, not admin-created.
@Schema({ timestamps: true })
export class ProductRange {
  // Explicit `type: String` — a string-literal union like ProductRangeKey
  // emits no usable design:type reflection metadata, so @nestjs/mongoose
  // can't infer it (same root cause as PROGRESS.md bug #6).
  @Prop({ type: String, required: true, unique: true, index: true })
  slug!: ProductRangeKey;

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  name!: { en: string; fr: string; ar: string };

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  description!: { en: string; fr: string; ar: string };

  @Prop({ type: String, default: null })
  heroImage!: string | null;
}

export const ProductRangeSchema = SchemaFactory.createForClass(ProductRange);
