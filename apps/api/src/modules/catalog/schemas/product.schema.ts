import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ProductDocument = HydratedDocument<Product>;

export type RoutineStep = "morning" | "evening" | "both";
export type ProductVisibility = "b2c" | "b2b_cabin" | "both";
export type ProductStatus = "draft" | "published" | "archived";

// See DATA_MODEL.md "Product". `activeIngredientIds`/a standalone Ingredient
// collection are deferred to Sprint 10's catalog admin (see DECISIONS.md) —
// `fullIngredientsText` carries real INCI-style ingredient text for now.
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ type: Types.ObjectId, ref: "ProductRange", required: true, index: true })
  rangeId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "Category", default: [] })
  categoryIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: "SkinConcern", default: [] })
  concernIds!: Types.ObjectId[];

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  name!: { en: string; fr: string; ar: string };

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  shortBenefit!: { en: string; fr: string; ar: string };

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  description!: { en: string; fr: string; ar: string };

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  howToUse!: { en: string; fr: string; ar: string };

  @Prop({ type: String, required: true, enum: ["morning", "evening", "both"] })
  routineStep!: RoutineStep;

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  fullIngredientsText!: { en: string; fr: string; ar: string };

  @Prop({ type: String, default: "b2c", enum: ["b2c", "b2b_cabin", "both"] })
  visibility!: ProductVisibility;

  @Prop({
    type: String,
    default: "draft",
    enum: ["draft", "published", "archived"],
    index: true,
  })
  status!: ProductStatus;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: { en: String, fr: String, ar: String }, default: null })
  benefits?: { en: string; fr: string; ar: string } | null;

  @Prop({ type: { en: String, fr: String, ar: String }, default: null })
  activeIngredients?: { en: string; fr: string; ar: string } | null;

  @Prop({ type: { en: String, fr: String, ar: String }, default: null })
  texture?: { en: string; fr: string; ar: string } | null;

  @Prop({ type: { en: String, fr: String, ar: String }, default: null })
  officialClaims?: { en: string; fr: string; ar: string } | null;

  @Prop({ type: String, default: null })
  sourceUrl?: string | null;

  @Prop({ type: String, default: "AVAILABLE", enum: ["AVAILABLE", "PENDING"] })
  uaeAvailability!: "AVAILABLE" | "PENDING";

  @Prop({ type: Boolean, default: false })
  isBestSeller!: boolean;

  @Prop({ type: Number, default: 5.0 })
  rating!: number;

  @Prop({ type: Number, default: 0 })
  reviewCount!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ status: 1, rangeId: 1 });
ProductSchema.index({ "name.en": "text", "shortBenefit.en": "text", "name.fr": "text" });
