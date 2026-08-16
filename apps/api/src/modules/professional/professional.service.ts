import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ProfessionalApplication,
  ProfessionalApplicationDocument,
} from "./schemas/professional-application.schema";
import {
  ProfessionalProfile,
  ProfessionalProfileDocument,
} from "./schemas/professional-profile.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectModel(ProfessionalApplication.name)
    private readonly applicationModel: Model<ProfessionalApplicationDocument>,
    @InjectModel(ProfessionalProfile.name)
    private readonly profileModel: Model<ProfessionalProfileDocument>,
    private readonly usersService: UsersService,
  ) {}

  // --- Application lifecycle ---

  async getOrCreateDraft(userId: string) {
    let app = await this.applicationModel.findOne({
      userId: new Types.ObjectId(userId),
      status: "draft",
    });
    if (!app) {
      app = await this.applicationModel.create({
        userId: new Types.ObjectId(userId),
        status: "draft",
        statusHistory: [{ status: "draft", at: new Date() }],
      });
    }
    return app.toObject();
  }

  async getApplication(userId: string, applicationId: string) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) throw new NotFoundException("Application not found.");
    if (app.userId.toString() !== userId) {
      throw new ForbiddenException("You do not have access to this application.");
    }
    return app.toObject();
  }

  async listMyApplications(userId: string) {
    return this.applicationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async submitApplication(
    userId: string,
    applicationId: string,
    dto: SubmitApplicationDto,
  ) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) throw new NotFoundException("Application not found.");
    if (app.userId.toString() !== userId) {
      throw new ForbiddenException("You do not have access to this application.");
    }
    if (app.status !== "draft" && app.status !== "documents_requested") {
      throw new BadRequestException(
        "Only draft or documents-requested applications can be submitted.",
      );
    }

    // Update fields
    Object.assign(app, dto);
    app.status = "submitted";
    app.statusHistory.push({ status: "submitted", at: new Date(), note: null });
    await app.save();

    // Ensure user has professional_pending role
    await this.usersService.addRole(userId, "professional_pending");

    return app.toObject();
  }

  async addDocument(
    userId: string,
    applicationId: string,
    document: {
      documentId: string | Types.ObjectId;
      originalName: string;
      mimeType: string;
    },
  ) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) throw new NotFoundException("Application not found.");
    if (app.userId.toString() !== userId) {
      throw new ForbiddenException("You do not have access to this application.");
    }
    if (app.status !== "draft" && app.status !== "documents_requested") {
      throw new BadRequestException("Cannot add documents to this application.");
    }
    app.documents.push({
      documentId: new Types.ObjectId(document.documentId),
      originalName: document.originalName,
      mimeType: document.mimeType,
    });
    await app.save();
    return app.toObject();
  }

  // --- Admin review ---

  async listPendingApplications() {
    return this.applicationModel
      .find({ status: { $in: ["submitted", "pending_review", "documents_requested"] } })
      .populate<{ userId: { email: string; firstName: string; lastName: string } }>(
        "userId",
        "email firstName lastName",
      )
      .sort({ createdAt: 1 })
      .lean();
  }

  async getApplicationAdmin(applicationId: string) {
    const app = await this.applicationModel
      .findById(applicationId)
      .populate<{ userId: { email: string; firstName: string; lastName: string } }>(
        "userId",
        "email firstName lastName",
      );
    if (!app) throw new NotFoundException("Application not found.");
    return app.toObject();
  }

  async approveApplication(adminId: string, applicationId: string, reviewNotes?: string) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) throw new NotFoundException("Application not found.");
    if (!["submitted", "pending_review", "documents_requested"].includes(app.status)) {
      throw new BadRequestException("Application is not in a reviewable state.");
    }

    app.status = "approved";
    app.reviewedBy = new Types.ObjectId(adminId);
    app.reviewNotes = reviewNotes ?? null;
    app.statusHistory.push({
      status: "approved",
      at: new Date(),
      note: reviewNotes ?? null,
    });
    await app.save();

    // Update user roles
    await this.usersService.removeRole(app.userId.toString(), "professional_pending");
    await this.usersService.addRole(app.userId.toString(), "professional_approved");

    // Create professional profile
    const profile = await this.profileModel.create({
      userId: app.userId,
      applicationId: app._id,
      companyName: app.companyName,
      businessType: app.businessType,
      emirate: app.emirate,
      city: app.city,
      status: "approved",
    });

    return { application: app.toObject(), profile: profile.toObject() };
  }

  async rejectApplication(adminId: string, applicationId: string, reviewNotes: string) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) throw new NotFoundException("Application not found.");
    if (!["submitted", "pending_review", "documents_requested"].includes(app.status)) {
      throw new BadRequestException("Application is not in a reviewable state.");
    }

    app.status = "rejected";
    app.reviewedBy = new Types.ObjectId(adminId);
    app.reviewNotes = reviewNotes;
    app.statusHistory.push({ status: "rejected", at: new Date(), note: reviewNotes });
    await app.save();

    await this.usersService.removeRole(app.userId.toString(), "professional_pending");

    return app.toObject();
  }

  async requestDocuments(adminId: string, applicationId: string, reviewNotes: string) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) throw new NotFoundException("Application not found.");
    if (!["submitted", "pending_review"].includes(app.status)) {
      throw new BadRequestException("Application is not in a reviewable state.");
    }

    app.status = "documents_requested";
    app.reviewedBy = new Types.ObjectId(adminId);
    app.reviewNotes = reviewNotes;
    app.statusHistory.push({
      status: "documents_requested",
      at: new Date(),
      note: reviewNotes,
    });
    await app.save();

    return app.toObject();
  }

  async suspendProfile(_adminId: string, profileId: string, _reason: string) {
    const profile = await this.profileModel.findById(profileId);
    if (!profile) throw new NotFoundException("Professional profile not found.");

    profile.status = "suspended";
    await profile.save();

    await this.usersService.removeRole(
      profile.userId.toString(),
      "professional_approved",
    );
    await this.usersService.addRole(profile.userId.toString(), "professional_suspended");

    return profile.toObject();
  }

  // --- Profile lookups ---

  async getProfileByUserId(userId: string) {
    return this.profileModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
  }

  async getProfileById(profileId: string) {
    return this.profileModel.findById(profileId).lean();
  }

  async listApprovedProfiles() {
    return this.profileModel.find({ status: "approved" }).lean();
  }
}

export interface SubmitApplicationDto {
  companyName: string;
  contactPerson: string;
  businessType: string;
  tradeLicenceNumber: string;
  vatNumber?: string;
  email: string;
  phone: string;
  address: string;
  emirate: string;
  city: string;
  website?: string;
  socialMedia?: string;
  locationsCount: number;
  expectedOrderVolume: string;
  message?: string;
}
