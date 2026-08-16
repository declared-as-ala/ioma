import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  NewsletterSubscriber,
  NewsletterSubscriberDocument,
} from "./schemas/newsletter-subscriber.schema";
import type { SubscribeNewsletterDto } from "./dto/subscribe-newsletter.dto";

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscriber.name)
    private readonly subscriberModel: Model<NewsletterSubscriberDocument>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const email = dto.email.toLowerCase().trim();
    await this.subscriberModel.updateOne(
      { email },
      { $set: { locale: dto.locale, status: "subscribed" } },
      { upsert: true },
    );
    return { subscribed: true };
  }
}
