import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CartDocument = HydratedDocument<Cart>;

export class CartItem {
  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  qty!: number;

  @Prop({ required: true })
  priceMinorSnapshot!: number;
}

// See DATA_MODEL.md "Cart". Guests are identified by `sessionId` (a UUID
// the frontend generates once and persists in localStorage — see
// DECISIONS.md), logged-in customers by `userId`; exactly one is set.
// `expiresAt` TTL-indexes abandoned guest carts.
@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: "User", default: null, index: true })
  userId!: Types.ObjectId | null;

  @Prop({ type: String, default: null, index: true })
  sessionId!: string | null;

  @Prop({ type: String, default: "b2c", enum: ["b2c", "b2b"] })
  type!: "b2c" | "b2b";

  @Prop({ type: [CartItem], default: [] })
  items!: CartItem[];

  @Prop({ type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
  expiresAt!: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
