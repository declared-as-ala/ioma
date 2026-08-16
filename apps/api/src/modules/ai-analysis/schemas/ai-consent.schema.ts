import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiConsentDocument = HydratedDocument<AiConsent>;

// Current consent copy version — bump whenever the consent/privacy notice
// text materially changes, so old consent records stay auditable against
// the copy the user actually saw (see SECURITY.md).
export const CURRENT_AI_CONSENT_VERSION = "2026-08-06.1";

// See DATA_MODEL.md "AIConsent".
@Schema({ timestamps: true })
export class AiConsent {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  consentedAt!: Date;

  @Prop({ required: true })
  consentVersion!: string;

  // Hashed, never the raw IP — see SECURITY.md redaction rules.
  @Prop({ required: true })
  ipAddressHash!: string;

  @Prop({ type: Date, default: null })
  withdrawnAt!: Date | null;
}

export const AiConsentSchema = SchemaFactory.createForClass(AiConsent);
