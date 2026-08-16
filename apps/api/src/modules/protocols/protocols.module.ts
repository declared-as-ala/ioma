import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Protocol, ProtocolSchema } from "./schemas/protocol.schema";
import { DocumentsModule } from "../documents/documents.module";
import { ProtocolsService } from "./protocols.service";
import { ProtocolsController } from "./protocols.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Protocol.name, schema: ProtocolSchema }]),
    DocumentsModule,
  ],
  controllers: [ProtocolsController],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
