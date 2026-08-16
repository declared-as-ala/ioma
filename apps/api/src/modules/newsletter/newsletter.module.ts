import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  NewsletterSubscriber,
  NewsletterSubscriberSchema,
} from "./schemas/newsletter-subscriber.schema";
import { NewsletterService } from "./newsletter.service";
import { NewsletterController } from "./newsletter.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NewsletterSubscriber.name, schema: NewsletterSubscriberSchema },
    ]),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
