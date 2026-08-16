import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AccountDeletionRequestDocument = HydratedDocument<AccountDeletionRequest>;
export type AccountDeletionStatus = "pending" | "processed" | "cancelled";

// Deletion is a *request*, never an immediate delete — see SPRINTS.md
// Sprint 5 acceptance criteria: "account deletion request creates an
// auditable admin-visible record rather than silently deleting." Actually
// processing the request (data erasure/anonymization workflow) is Sprint
// 10 admin scope; this module only records the request.
@Schema({ timestamps: true })
export class AccountDeletionRequest {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, default: null })
  reason!: string | null;

  @Prop({
    type: String,
    default: "pending",
    enum: ["pending", "processed", "cancelled"],
    index: true,
  })
  status!: AccountDeletionStatus;
}

export const AccountDeletionRequestSchema =
  SchemaFactory.createForClass(AccountDeletionRequest);
