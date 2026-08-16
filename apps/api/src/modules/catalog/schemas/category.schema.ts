import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

// See DATA_MODEL.md "Category". `parentId` self-ref supports a future
// sub-category tree; the Sprint 4 seed only populates top-level categories.
@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  name!: { en: string; fr: string; ar: string };

  @Prop({ type: Types.ObjectId, ref: Category.name, default: null, index: true })
  parentId!: Types.ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
