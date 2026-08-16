import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AddressDocument = HydratedDocument<Address>;
export type AddressType = "shipping" | "billing";

// See DATA_MODEL.md "Address". `fullName` is a specification refinement
// (not in the original DATA_MODEL row) — a saved delivery address without
// a recipient name isn't actually usable at checkout.
@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ["shipping", "billing"] })
  type!: AddressType;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  line1!: string;

  @Prop({ type: String, default: null })
  line2!: string | null;

  @Prop({ required: true })
  emirate!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true, default: false })
  isDefault!: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
AddressSchema.index({ userId: 1, type: 1 });
