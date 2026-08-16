import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ProfessionalApplicationDocument = HydratedDocument<ProfessionalApplication>;

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "documents_requested"
  | "approved"
  | "rejected"
  | "suspended";

export type BusinessType =
  "spa" | "clinic" | "beauty_institute" | "hotel" | "retail" | "distributor";

export class ApplicationDocument {
  @Prop({ type: Types.ObjectId, ref: "DocumentRecord", required: true })
  documentId!: Types.ObjectId;

  @Prop({ required: true })
  originalName!: string;

  @Prop({ required: true })
  mimeType!: string;
}

class StatusHistoryEntry {
  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  at!: Date;

  @Prop({ type: String, default: null })
  note!: string | null;
}

// DATA_MODEL.md "ProfessionalApplication" — application for B2B portal access.
// State machine: draft → submitted → pending_review → documents_requested
//   → approved | rejected → (suspended)
@Schema({ timestamps: true })
export class ProfessionalApplication {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  companyName!: string;

  @Prop({ required: true, trim: true })
  contactPerson!: string;

  @Prop({
    required: true,
    enum: ["spa", "clinic", "beauty_institute", "hotel", "retail", "distributor"],
  })
  businessType!: BusinessType;

  @Prop({ required: true, trim: true })
  tradeLicenceNumber!: string;

  @Prop({ type: String, default: null, trim: true })
  vatNumber!: string | null;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true })
  emirate!: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({ type: String, default: null, trim: true })
  website!: string | null;

  @Prop({ type: String, default: null, trim: true })
  socialMedia!: string | null;

  @Prop({ required: true, min: 1 })
  locationsCount!: number;

  @Prop({ required: true, trim: true })
  expectedOrderVolume!: string;

  @Prop({ type: String, default: null, trim: true })
  message!: string | null;

  @Prop({ type: [ApplicationDocument], default: [] })
  documents!: ApplicationDocument[];

  @Prop({
    type: String,
    default: "draft",
    enum: [
      "draft",
      "submitted",
      "pending_review",
      "documents_requested",
      "approved",
      "rejected",
      "suspended",
    ],
    index: true,
  })
  status!: ApplicationStatus;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  reviewedBy!: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  reviewNotes!: string | null;

  @Prop({ type: [StatusHistoryEntry], default: [] })
  statusHistory!: StatusHistoryEntry[];
}

export const ProfessionalApplicationSchema = SchemaFactory.createForClass(
  ProfessionalApplication,
);
ProfessionalApplicationSchema.index({ userId: 1 });
ProfessionalApplicationSchema.index({ status: 1, createdAt: -1 });
