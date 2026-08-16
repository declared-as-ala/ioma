import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ProfessionalService } from "./professional.service";
import { Roles } from "../../common/guards/auth.decorators";
import { RolesGuard } from "../../common/guards/roles.guard";
import { DocumentsService } from "../documents/documents.service";
import { Types } from "mongoose";

const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

export class SubmitApplicationBody {
  companyName!: string;
  contactPerson!: string;
  businessType!: string;
  tradeLicenceNumber!: string;
  vatNumber?: string;
  email!: string;
  phone!: string;
  address!: string;
  emirate!: string;
  city!: string;
  website?: string;
  socialMedia?: string;
  locationsCount!: number;
  expectedOrderVolume!: string;
  message?: string;
}

export class AddDocumentBody {
  documentId!: string;
  originalName!: string;
  mimeType!: string;
}

export class ReviewBody {
  reviewNotes?: string;
}

export class SuspendBody {
  reason!: string;
}

@ApiTags("professional")
@UseGuards(JwtAuthGuard)
@Controller("professional")
export class ProfessionalController {
  constructor(
    private readonly professionalService: ProfessionalService,
    private readonly documentsService: DocumentsService,
  ) {}

  // --- Applicant endpoints ---

  @Get("applications")
  listMyApplications(@CurrentUser() user: JwtPayload) {
    return this.professionalService.listMyApplications(user.sub);
  }

  @Get("applications/:id")
  getApplication(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.professionalService.getApplication(user.sub, id);
  }

  @Post("applications/draft")
  getOrCreateDraft(@CurrentUser() user: JwtPayload) {
    return this.professionalService.getOrCreateDraft(user.sub);
  }

  @Post("applications/:id/submit")
  submitApplication(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: SubmitApplicationBody,
  ) {
    return this.professionalService.submitApplication(user.sub, id, dto);
  }

  @Post("applications/:id/documents")
  addDocument(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: AddDocumentBody,
  ) {
    return this.professionalService.addDocument(user.sub, id, {
      documentId: dto.documentId,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
    });
  }

  @Post("applications/:id/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Param("id") applicationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("No file provided.");
    if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "File type not allowed. Accepted: PDF, JPEG, PNG, WebP.",
      );
    }
    if (file.size > MAX_DOC_SIZE) {
      throw new BadRequestException("File exceeds 10 MB limit.");
    }

    // Verify ownership
    await this.professionalService.getApplication(user.sub, applicationId);

    const ext = file.originalname.split(".").pop() ?? "bin";
    const doc = await this.documentsService.create({
      bucket: "ioma-private",
      data: file.buffer,
      mimeType: file.mimetype,
      ownerType: "professional_application",
      ownerId: new Types.ObjectId(applicationId),
      uploadedBy: new Types.ObjectId(user.sub),
      extension: ext,
    });

    await this.professionalService.addDocument(user.sub, applicationId, {
      documentId: doc._id,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    return { documentId: doc._id, originalName: file.originalname };
  }

  // --- Admin endpoints ---

  @Get("admin/applications")
  @UseGuards(RolesGuard)
  @Roles("administrator", "super_administrator")
  listPendingApplications() {
    return this.professionalService.listPendingApplications();
  }

  @Get("admin/applications/:id")
  @UseGuards(RolesGuard)
  @Roles("administrator", "super_administrator")
  getApplicationAdmin(@Param("id") id: string) {
    return this.professionalService.getApplicationAdmin(id);
  }

  @Patch("admin/applications/:id/approve")
  @UseGuards(RolesGuard)
  @Roles("administrator", "super_administrator")
  approveApplication(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: ReviewBody,
  ) {
    return this.professionalService.approveApplication(user.sub, id, dto.reviewNotes);
  }

  @Patch("admin/applications/:id/reject")
  @UseGuards(RolesGuard)
  @Roles("administrator", "super_administrator")
  rejectApplication(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: ReviewBody,
  ) {
    return this.professionalService.rejectApplication(
      user.sub,
      id,
      dto.reviewNotes ?? "Rejected",
    );
  }

  @Patch("admin/applications/:id/request-documents")
  @UseGuards(RolesGuard)
  @Roles("administrator", "super_administrator")
  requestDocuments(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: ReviewBody,
  ) {
    return this.professionalService.requestDocuments(
      user.sub,
      id,
      dto.reviewNotes ?? "Additional documents required",
    );
  }

  @Patch("admin/profiles/:id/suspend")
  @UseGuards(RolesGuard)
  @Roles("administrator", "super_administrator")
  suspendProfile(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: SuspendBody,
  ) {
    return this.professionalService.suspendProfile(user.sub, id, dto.reason);
  }
}
