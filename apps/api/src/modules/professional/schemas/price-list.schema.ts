import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type PriceListDocument = HydratedDocument<PriceList>;

export class PriceListItem {
  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  b2bPriceMinor!: number;

  @Prop({ type: Number, default: null, min: 1 })
  moq!: number | null;
}

// DATA_MODEL.md "PriceList" — per-professional pricing overrides.
// When a ProfessionalProfile has a priceListId, the cart/checkout uses
// the B2B prices from this list instead of variant.b2bPriceMinor.
@Schema({ timestamps: true })
export class PriceList {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: [PriceListItem], default: [] })
  items!: PriceListItem[];

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const PriceListSchema = SchemaFactory.createForClass(PriceList);
