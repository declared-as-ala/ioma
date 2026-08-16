import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  actorEmail!: string;

  @Prop({ required: true, index: true })
  action!: string; // e.g. "product.created", "order.status_updated", "professional.approved"

  @Prop({ required: true, index: true })
  resource!: string; // e.g. "product", "order", "professional_application"

  @Prop({ type: String, required: false, index: true })
  resourceId?: string;

  @Prop({ type: Object, required: false })
  details?: Record<string, any>;

  @Prop({ required: false })
  ipAddress?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
