import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ProductRange, ProductRangeDocument } from "./schemas/product-range.schema";
import { Category, CategoryDocument } from "./schemas/category.schema";
import { SkinConcern, SkinConcernDocument } from "./schemas/skin-concern.schema";
import { Product, ProductDocument } from "./schemas/product.schema";
import { ProductVariant, ProductVariantDocument } from "./schemas/product-variant.schema";
import type { QueryProductsDto } from "./dto/query-products.dto";

export interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}

type PopulatedRange = { _id: Types.ObjectId; slug: string; name: LocalizedText };
type PopulatedCategory = { _id: Types.ObjectId; slug: string; name: LocalizedText };
type PopulatedConcern = {
  _id: Types.ObjectId;
  slug: string;
  name: LocalizedText;
  icon: string;
};

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(ProductRange.name)
    private readonly rangeModel: Model<ProductRangeDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SkinConcern.name)
    private readonly concernModel: Model<SkinConcernDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  listRanges() {
    return this.rangeModel.find().sort({ slug: 1 }).lean();
  }

  listCategories() {
    return this.categoryModel.find().sort({ "name.en": 1 }).lean();
  }

  listConcerns() {
    return this.concernModel.find().sort({ "name.en": 1 }).lean();
  }

  async listProducts(query: QueryProductsDto) {
    const filter: Record<string, unknown> = { status: "published" };

    if (query.range) {
      const range = await this.rangeModel.findOne({ slug: query.range }).lean();
      if (!range) return [];
      filter.rangeId = range._id;
    }

    if (query.category) {
      const category = await this.categoryModel.findOne({ slug: query.category }).lean();
      if (!category) return [];
      filter.categoryIds = category._id;
    }

    if (query.concern) {
      const concern = await this.concernModel.findOne({ slug: query.concern }).lean();
      if (!concern) return [];
      filter.concernIds = concern._id;
    }

    if (query.q) {
      filter.$text = { $search: query.q };
    }

    const products = await this.productModel
      .find(filter)
      .populate<{ rangeId: PopulatedRange }>("rangeId")
      .lean();
    const variants = await this.variantModel
      .find({ productId: { $in: products.map((p) => p._id) } })
      .lean();

    return products.map((product) => {
      const productVariants = variants.filter(
        (v) => v.productId.toString() === product._id.toString(),
      );
      const priceFromMinor = productVariants.length
        ? Math.min(...productVariants.map((v) => v.b2cPriceMinor))
        : null;

      return {
        slug: product.slug,
        name: product.name,
        shortBenefit: product.shortBenefit,
        routineStep: product.routineStep,
        images: product.images,
        range: { slug: product.rangeId.slug, name: product.rangeId.name },
        priceFromMinor,
      };
    });
  }

  async getProductBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, status: "published" })
      .populate<{ rangeId: PopulatedRange }>("rangeId")
      .populate<{ categoryIds: PopulatedCategory[] }>("categoryIds")
      .populate<{ concernIds: PopulatedConcern[] }>("concernIds")
      .lean();

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    const variants = await this.variantModel.find({ productId: product._id }).lean();

    return {
      id: product._id,
      slug: product.slug,
      range: { slug: product.rangeId.slug, name: product.rangeId.name },
      name: product.name,
      shortBenefit: product.shortBenefit,
      description: product.description,
      howToUse: product.howToUse,
      routineStep: product.routineStep,
      fullIngredientsText: product.fullIngredientsText,
      images: product.images,
      categories: product.categoryIds.map((c) => ({ slug: c.slug, name: c.name })),
      concerns: product.concernIds.map((c) => ({
        slug: c.slug,
        name: c.name,
        icon: c.icon,
      })),
      variants: variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        priceMinor: v.b2cPriceMinor,
        inStock: v.quantityOnHand - v.quantityReserved > 0 || v.backorderAllowed,
      })),
    };
  }

  // B2B catalog: products visible to professionals (visibility b2b_cabin or both)
  async listB2BProducts(query: QueryProductsDto) {
    const filter: Record<string, unknown> = {
      status: "published",
      visibility: { $in: ["b2b_cabin", "both"] },
    };

    if (query.range) {
      const range = await this.rangeModel.findOne({ slug: query.range }).lean();
      if (!range) return [];
      filter.rangeId = range._id;
    }

    if (query.category) {
      const category = await this.categoryModel.findOne({ slug: query.category }).lean();
      if (!category) return [];
      filter.categoryIds = category._id;
    }

    if (query.q) {
      filter.$text = { $search: query.q };
    }

    const products = await this.productModel
      .find(filter)
      .populate<{ rangeId: PopulatedRange }>("rangeId")
      .lean();
    const variants = await this.variantModel
      .find({ productId: { $in: products.map((p) => p._id) } })
      .lean();

    return products.map((product) => {
      const productVariants = variants.filter(
        (v) => v.productId.toString() === product._id.toString(),
      );
      const priceFromMinor = productVariants.length
        ? Math.min(
            ...productVariants
              .map((v) => v.b2bPriceMinor)
              .filter((p): p is number => p !== null),
          )
        : null;

      return {
        slug: product.slug,
        name: product.name,
        shortBenefit: product.shortBenefit,
        routineStep: product.routineStep,
        images: product.images,
        range: { slug: product.rangeId.slug, name: product.rangeId.name },
        priceFromMinor,
        variants: productVariants.map((v) => ({
          sku: v.sku,
          size: v.size,
          b2cPriceMinor: v.b2cPriceMinor,
          b2bPriceMinor: v.b2bPriceMinor,
          moq: v.moq,
          inStock: v.quantityOnHand - v.quantityReserved > 0 || v.backorderAllowed,
        })),
      };
    });
  }
}
