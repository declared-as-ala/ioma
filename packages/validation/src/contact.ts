import { z } from "zod";

// Mirrors apps/api/src/modules/contact/dto/create-contact-message.dto.ts
// and apps/api/src/modules/newsletter/dto/subscribe-newsletter.dto.ts.
export const contactMessageSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(150),
  message: z.string().min(10).max(2000),
  locale: z.enum(["en", "fr", "ar"]),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  locale: z.enum(["en", "fr", "ar"]),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
