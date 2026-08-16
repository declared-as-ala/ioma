import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageModule } from "../../common/storage/storage.module";
import { DocumentRecord, DocumentRecordSchema } from "./schemas/document.schema";
import { DocumentsService } from "./documents.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentRecord.name, schema: DocumentRecordSchema },
    ]),
    StorageModule,
  ],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
