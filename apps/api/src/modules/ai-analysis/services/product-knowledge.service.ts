import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product, ProductDocument } from "../../catalog/schemas/product.schema";
import {
  ProductVariant,
  ProductVariantDocument,
} from "../../catalog/schemas/product-variant.schema";
import {
  ProductRange,
  ProductRangeDocument,
} from "../../catalog/schemas/product-range.schema";
import {
  SkinConcern,
  SkinConcernDocument,
} from "../../catalog/schemas/skin-concern.schema";
import { Category, CategoryDocument } from "../../catalog/schemas/category.schema";

export interface PopulatedProductWithVariants {
  product: ProductDocument;
  range: ProductRangeDocument;
  variants: ProductVariantDocument[];
}

@Injectable()
export class ProductKnowledgeService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    @InjectModel(ProductRange.name)
    private readonly rangeModel: Model<ProductRangeDocument>,
    @InjectModel(SkinConcern.name)
    private readonly concernModel: Model<SkinConcernDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getAllPublishedCatalogue(): Promise<PopulatedProductWithVariants[]> {
    const products: any[] = await this.productModel
      .find({ status: "published", visibility: { $in: ["b2c", "both"] } })
      .populate("rangeId")
      .lean();

    const productIds = products.map((p) => p._id);
    const variants: any[] = await this.variantModel
      .find({ productId: { $in: productIds } })
      .lean();

    const ranges: any[] = await this.rangeModel.find().lean();

    return products.map((prod) => {
      const prodRange =
        ranges.find((r) => r._id.toString() === prod.rangeId?._id?.toString()) ||
        prod.rangeId;
      const prodVariants = variants.filter(
        (v) => v.productId.toString() === prod._id.toString(),
      );
      return {
        product: prod as ProductDocument,
        range: prodRange as ProductRangeDocument,
        variants: prodVariants as ProductVariantDocument[],
      };
    });
  }

  async getRangeBySlug(slug: string): Promise<ProductRangeDocument | null> {
    return (await this.rangeModel
      .findOne({ slug })
      .lean()) as ProductRangeDocument | null;
  }

  async listAllRanges(): Promise<ProductRangeDocument[]> {
    return (await this.rangeModel.find().lean()) as ProductRangeDocument[];
  }

  async listAllConcerns(): Promise<SkinConcernDocument[]> {
    return (await this.concernModel.find().lean()) as SkinConcernDocument[];
  }
}
