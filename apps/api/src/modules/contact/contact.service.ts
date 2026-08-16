import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContactMessage, ContactMessageDocument } from "./schemas/contact-message.schema";
import type { CreateContactMessageDto } from "./dto/create-contact-message.dto";

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const message = new this.contactMessageModel(dto);
    await message.save();
    return { id: message.id, receivedAt: message.get("createdAt") as Date };
  }
}
