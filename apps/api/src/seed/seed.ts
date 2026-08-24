/**
 * Populates development/demo data so every screen is reviewable before
 * real client content exists (see CLIENT_REQUIREMENTS.md). Gated behind
 * NODE_ENV !== 'production' as a safety rail against accidentally seeding
 * a live database. Extended module-by-module as each sprint's schemas land
 * — Sprint 1 seeds only the baseline admin user needed to access the API.
 */
import "reflect-metadata";
import mongoose from "mongoose";
import * as argon2 from "argon2";
import { User, UserSchema } from "../modules/users/schemas/user.schema";
import {
  ProductRange,
  ProductRangeSchema,
} from "../modules/catalog/schemas/product-range.schema";
import { Category, CategorySchema } from "../modules/catalog/schemas/category.schema";
import {
  SkinConcern,
  SkinConcernSchema,
} from "../modules/catalog/schemas/skin-concern.schema";
import { Product, ProductSchema } from "../modules/catalog/schemas/product.schema";
import {
  ProductVariant,
  ProductVariantSchema,
} from "../modules/catalog/schemas/product-variant.schema";
import {
  RANGE_SEED,
  CATEGORY_SEED,
  CONCERN_SEED,
  PRODUCT_SEED,
  PENDING_INGREDIENTS,
} from "./catalog-data";
import {
  DiagnosisRecommendation,
  DiagnosisRecommendationSchema,
} from "../modules/diagnosis/schemas/diagnosis-recommendation.schema";
import { DIAGNOSIS_RECOMMENDATION_SEED } from "./diagnosis-data";
import { Partner, PartnerSchema } from "../modules/partners/schemas/partner.schema";
import { Service, ServiceSchema } from "../modules/partners/schemas/service.schema";
import { Treatment, TreatmentSchema } from "../modules/partners/schemas/treatment.schema";
import {
  Availability,
  AvailabilitySchema,
} from "../modules/partners/schemas/availability.schema";
import {
  SERVICE_SEED,
  TREATMENT_SEED,
  PARTNER_SEED,
  AVAILABILITY_SEED,
} from "./partner-data";

import { Training, TrainingSchema } from "../modules/trainings/schemas/training.schema";
import {
  TrainingSession,
  TrainingSessionSchema,
} from "../modules/trainings/schemas/training-session.schema";
import { Protocol, ProtocolSchema } from "../modules/protocols/schemas/protocol.schema";

async function seedUsers() {
  const UserModel = mongoose.model(User.name, UserSchema);
  const passwordHash = await argon2.hash("ChangeMe123!", { type: argon2.argon2id });

  // 1. Super Administrator
  await UserModel.updateOne(
    { email: "admin@ioma-dev.local" },
    {
      $set: {
        passwordHash,
        firstName: "IOMA",
        lastName: "Admin",
        roles: ["super_administrator"],
        locale: "en",
        emailVerifiedAt: new Date(),
      },
    },
    { upsert: true },
  );
  console.log("Seeded/Updated admin user: admin@ioma-dev.local / ChangeMe123!");

  // 2. Verified B2B Partner / Spa Professional
  await UserModel.updateOne(
    { email: "partner@ioma-dev.local" },
    {
      $set: {
        passwordHash,
        firstName: "Partner",
        lastName: "Professional",
        roles: ["customer", "professional_approved"],
        locale: "en",
        emailVerifiedAt: new Date(),
      },
    },
    { upsert: true },
  );
  console.log("Seeded/Updated partner user: partner@ioma-dev.local / ChangeMe123!");

  // 3. Regular Customer User
  await UserModel.updateOne(
    { email: "user@ioma-dev.local" },
    {
      $set: {
        passwordHash,
        firstName: "Sarah",
        lastName: "Customer",
        roles: ["customer"],
        locale: "en",
        emailVerifiedAt: new Date(),
      },
    },
    { upsert: true },
  );
  console.log("Seeded/Updated regular customer user: user@ioma-dev.local / ChangeMe123!");
}

async function seedCatalog() {
  const RangeModel = mongoose.model(ProductRange.name, ProductRangeSchema);
  const CategoryModel = mongoose.model(Category.name, CategorySchema);
  const ConcernModel = mongoose.model(SkinConcern.name, SkinConcernSchema);
  const ProductModel = mongoose.model(Product.name, ProductSchema);
  const VariantModel = mongoose.model(ProductVariant.name, ProductVariantSchema);

  for (const range of RANGE_SEED) {
    await RangeModel.updateOne(
      { slug: range.slug },
      { $set: { name: range.name, description: range.description } },
      { upsert: true },
    );
  }

  for (const category of CATEGORY_SEED) {
    await CategoryModel.updateOne(
      { slug: category.slug },
      { $set: { name: category.name } },
      { upsert: true },
    );
  }

  for (const concern of CONCERN_SEED) {
    await ConcernModel.updateOne(
      { slug: concern.slug },
      { $set: { name: concern.name, icon: concern.icon } },
      { upsert: true },
    );
  }

  let createdProducts = 0;
  let createdVariants = 0;

  for (const product of PRODUCT_SEED) {
    const range = await RangeModel.findOne({ slug: product.range });
    const category = await CategoryModel.findOne({ slug: product.category });
    const concern = await ConcernModel.findOne({ slug: product.concern });
    if (!range || !category || !concern) {
      throw new Error(`Seed data inconsistency for product ${product.slug}`);
    }

    const doc = await ProductModel.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          rangeId: range._id,
          categoryIds: [category._id],
          concernIds: [concern._id],
          name: product.name,
          shortBenefit: product.shortBenefit,
          description: product.description,
          howToUse: product.howToUse,
          routineStep: product.routineStep,
          fullIngredientsText: PENDING_INGREDIENTS,
          visibility: "b2c",
          status: "published",
          images: [`/images/products/${product.range}.png`],
        },
      },
      { upsert: true, new: true },
    );

    const createdAt = doc.get("createdAt") as Date;
    const updatedAt = doc.get("updatedAt") as Date;
    if (createdAt.getTime() === updatedAt.getTime()) createdProducts += 1;

    for (const variant of product.variants) {
      const sku = `${product.slug}-${variant.size}`.toUpperCase();
      const variantDoc = await VariantModel.findOneAndUpdate(
        { sku },
        {
          $set: {
            productId: doc._id,
            size: variant.size,
            b2cPriceMinor: variant.b2cPriceMinor,
          },
          $setOnInsert: {
            quantityOnHand: 100,
            quantityReserved: 0,
            lowStockThreshold: 5,
            backorderAllowed: false,
          },
        },
        { upsert: true, new: true },
      );
      const variantCreatedAt = variantDoc.get("createdAt") as Date;
      const variantUpdatedAt = variantDoc.get("updatedAt") as Date;
      if (variantCreatedAt.getTime() === variantUpdatedAt.getTime()) createdVariants += 1;
    }
  }

  console.log(
    `Catalog seed complete: ${RANGE_SEED.length} ranges, ${CATEGORY_SEED.length} categories, ${CONCERN_SEED.length} concerns, ${createdProducts}/${PRODUCT_SEED.length} products newly created, ${createdVariants} variants newly created.`,
  );
}

async function seedDiagnosis() {
  const RangeModel = mongoose.model(ProductRange.name, ProductRangeSchema);
  const ConcernModel = mongoose.model(SkinConcern.name, SkinConcernSchema);
  const RecommendationModel = mongoose.model(
    DiagnosisRecommendation.name,
    DiagnosisRecommendationSchema,
  );

  // Idempotent by (conditions, priority) rather than a synthetic slug —
  // these rules have no natural unique key of their own, so re-running the
  // seed clears and reinserts the full set instead of risking duplicates.
  await RecommendationModel.deleteMany({});

  let created = 0;
  for (const rule of DIAGNOSIS_RECOMMENDATION_SEED) {
    const range = await RangeModel.findOne({ slug: rule.resultRange });
    if (!range) {
      throw new Error(
        `Diagnosis seed references unknown range slug: ${rule.resultRange}`,
      );
    }
    const concerns = await ConcernModel.find({ slug: { $in: rule.resultConcernSlugs } });
    if (concerns.length !== rule.resultConcernSlugs.length) {
      throw new Error(
        `Diagnosis seed references unknown concern slug(s): ${rule.resultConcernSlugs.join(", ")}`,
      );
    }

    await RecommendationModel.create({
      conditions: rule.conditions,
      resultRangeId: range._id,
      resultConcernIds: concerns.map((c) => c._id),
      priority: rule.priority,
    });
    created += 1;
  }

  console.log(
    `Diagnosis seed complete: ${created}/${DIAGNOSIS_RECOMMENDATION_SEED.length} recommendation rules created.`,
  );
}

async function seedPartners() {
  const PartnerModel = mongoose.model(Partner.name, PartnerSchema);
  const ServiceModel = mongoose.model(Service.name, ServiceSchema);
  const TreatmentModel = mongoose.model(Treatment.name, TreatmentSchema);
  const AvailabilityModel = mongoose.model(Availability.name, AvailabilitySchema);

  // Seed services
  let createdServices = 0;
  for (const svc of SERVICE_SEED) {
    const doc = await ServiceModel.findOneAndUpdate(
      { slug: svc.slug },
      {
        $set: {
          name: svc.name,
          durationMinutes: svc.durationMinutes,
          category: svc.category,
        },
      },
      { upsert: true, new: true },
    );
    const createdAt = doc.get("createdAt") as Date;
    const updatedAt = doc.get("updatedAt") as Date;
    if (createdAt.getTime() === updatedAt.getTime()) createdServices += 1;
  }
  console.log(`Services seed: ${createdServices}/${SERVICE_SEED.length} newly created.`);

  // Seed treatments
  let createdTreatments = 0;
  for (const tx of TREATMENT_SEED) {
    const doc = await TreatmentModel.findOneAndUpdate(
      { slug: tx.slug },
      {
        $set: {
          name: tx.name,
          description: tx.description,
          durationMinutes: tx.durationMinutes,
        },
      },
      { upsert: true, new: true },
    );
    const createdAt = doc.get("createdAt") as Date;
    const updatedAt = doc.get("updatedAt") as Date;
    if (createdAt.getTime() === updatedAt.getTime()) createdTreatments += 1;
  }
  console.log(
    `Treatments seed: ${createdTreatments}/${TREATMENT_SEED.length} newly created.`,
  );

  // Seed partners
  let createdPartners = 0;
  for (const partner of PARTNER_SEED) {
    // Resolve service slugs to ObjectIds
    const services = await ServiceModel.find({ slug: { $in: partner.serviceSlugs } });
    const serviceIds = services.map((s) => s._id);

    const doc = await PartnerModel.findOneAndUpdate(
      { slug: partner.slug },
      {
        $set: {
          type: partner.type,
          name: partner.name,
          description: partner.description,
          emirate: partner.emirate,
          city: partner.city,
          address: partner.address,
          coordinates: partner.coordinates,
          phone: partner.phone,
          diagnosisAvailable: partner.diagnosisAvailable,
          serviceIds,
          status: "active",
        },
      },
      { upsert: true, new: true },
    );
    const createdAt = doc.get("createdAt") as Date;
    const updatedAt = doc.get("updatedAt") as Date;
    if (createdAt.getTime() === updatedAt.getTime()) createdPartners += 1;

    // Seed availability for this partner
    const avail = AVAILABILITY_SEED.find((a) => a.partnerSlug === partner.slug);
    if (avail) {
      await AvailabilityModel.findOneAndUpdate(
        { resourceType: "partner", resourceId: doc._id },
        {
          $set: {
            weeklyHours: avail.weeklyHours,
            breaks: avail.breaks,
            capacityPerSlot: avail.capacityPerSlot,
            blockedDates: [],
          },
        },
        { upsert: true },
      );
    }
  }
  console.log(
    `Partners seed: ${createdPartners}/${PARTNER_SEED.length} partners, ${AVAILABILITY_SEED.length} availability records.`,
  );
}

async function seedTrainingsAndProtocols() {
  const TrainingModel = mongoose.model(Training.name, TrainingSchema);
  const SessionModel = mongoose.model(TrainingSession.name, TrainingSessionSchema);
  const ProtocolModel = mongoose.model(Protocol.name, ProtocolSchema);

  const t1 = await TrainingModel.findOneAndUpdate(
    { slug: "ioma-sphere-mastery" },
    {
      $set: {
        name: {
          en: "IOMA Sphere Diagnosis Mastery",
          fr: "Maîtrise du Diagnostic IOMA Sphere",
          ar: "إتقان تشخيص آيوما سفير",
        },
        description: {
          en: "Comprehensive training on operating the IOMA Sphere 2 diagnostic machine, reading parameters, and prescribing targeted routines.",
          fr: "Formation complète sur l'utilisation de la machine de diagnostic IOMA Sphere 2.",
          ar: "تدريب شامل على تشغيل جهاز التشخيص آيوما سفير 2 وقراءة المؤشرات.",
        },
        mode: "physical",
        requiredLevel: "all",
        includedMaterials: [
          "PDF Protocol Guide",
          "Certificate of Completion",
          "Demo Kit",
        ],
      },
    },
    { upsert: true, new: true },
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(16, 0, 0, 0);

  await SessionModel.findOneAndUpdate(
    { trainingId: t1._id, startsAt: tomorrow },
    {
      $set: {
        endsAt: tomorrowEnd,
        location: "IOMA Training Center, Business Bay, Dubai",
        capacity: 12,
        seatsBooked: 2,
        priceMinor: 0,
      },
    },
    { upsert: true },
  );

  await ProtocolModel.findOneAndUpdate(
    { slug: "hydra-flash-in-cabin" },
    {
      $set: {
        title: {
          en: "Hydra Flash In-Cabin Protocol",
          fr: "Protocole En Cabine Hydra Flash",
          ar: "بروتوكول الهيدرا السريع في الكابينة",
        },
        description: {
          en: "30-minute intensive hydration protocol for immediate radiance and barrier comfort.",
          fr: "Protocole d'hydratation intense en 30 minutes.",
          ar: "بروتوكول ترطيب مكثف لمدة 30 دقيقة للإشراق الفوري.",
        },
        category: "facial",
        applicableRangeKeys: ["hydra"],
        durationMinutes: 30,
        isPublished: true,
      },
    },
    { upsert: true },
  );

  console.log("Trainings & Protocols seeded successfully.");
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run the seed script with NODE_ENV=production.");
  }

  const mongoUri = process.env.MONGO_URI ?? "mongodb://localhost:27017/ioma";
  await mongoose.connect(mongoUri);

  await seedUsers();
  await seedCatalog();
  await seedDiagnosis();
  await seedPartners();
  await seedTrainingsAndProtocols();

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
