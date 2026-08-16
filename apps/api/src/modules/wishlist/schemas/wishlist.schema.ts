import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WishlistDocument = HydratedDocument<Wishlist>;

// See DATA_MODEL.md "Wishlist". Auth-required (no guest wishlist) — the
// full account hub lands in Sprint 5; this module exposes just enough to
// let the PLP/PDP heart-toggle work end to end for logged-in customers.
@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "ProductVariant", default: [] })
  variantIds!: Types.ObjectId[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
