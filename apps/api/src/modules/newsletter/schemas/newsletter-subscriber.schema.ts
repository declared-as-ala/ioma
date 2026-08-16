import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NewsletterSubscriberDocument = HydratedDocument<NewsletterSubscriber>;

@Schema({ timestamps: true })
export class NewsletterSubscriber {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true })
  locale!: string;

  @Prop({ type: String, default: "subscribed", enum: ["subscribed", "unsubscribed"] })
  status!: "subscribed" | "unsubscribed";
}

export const NewsletterSubscriberSchema =
  SchemaFactory.createForClass(NewsletterSubscriber);
