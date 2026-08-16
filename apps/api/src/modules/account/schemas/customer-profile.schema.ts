import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CustomerProfileDocument = HydratedDocument<CustomerProfile>;

// See DATA_MODEL.md "CustomerProfile". `firstName`/`lastName` deliberately
// NOT duplicated here even though DATA_MODEL lists them — User already
// owns those fields (see UserSchema) and a second copy would just be a
// second place for them to drift out of sync. See DECISIONS.md.
@Schema({ timestamps: true })
export class CustomerProfile {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, default: null })
  phone!: string | null;

  @Prop({ type: Date, default: null })
  dateOfBirth!: Date | null;

  @Prop({ type: [String], default: [] })
  skinConcerns!: string[];

  @Prop({ required: true, default: false })
  newsletterOptIn!: boolean;

  @Prop({ type: String, default: "en" })
  preferredLocale!: string;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);
