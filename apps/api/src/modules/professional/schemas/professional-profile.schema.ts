import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ProfessionalProfileDocument = HydratedDocument<ProfessionalProfile>;

export type ProfessionalStatus = "approved" | "suspended";

// DATA_MODEL.md "ProfessionalProfile" — created once an application is approved.
// Links the user to their application, price list, and team.
@Schema({ timestamps: true })
export class ProfessionalProfile {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ProfessionalApplication", required: true })
  applicationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  companyName!: string;

  @Prop({ required: true })
  businessType!: string;

  @Prop({ required: true })
  emirate!: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({
    type: String,
    default: "approved",
    enum: ["approved", "suspended"],
    index: true,
  })
  status!: ProfessionalStatus;

  @Prop({ type: Types.ObjectId, ref: "PriceList", default: null })
  priceListId!: Types.ObjectId | null;

  @Prop({
    type: [{ userId: { type: Types.ObjectId, ref: "User" }, role: String }],
    default: [],
  })
  teamMembers!: { userId: Types.ObjectId; role: string }[];
}

export const ProfessionalProfileSchema =
  SchemaFactory.createForClass(ProfessionalProfile);
ProfessionalProfileSchema.index({ status: 1 });
