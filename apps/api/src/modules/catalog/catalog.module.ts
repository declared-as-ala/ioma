import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductRange, ProductRangeSchema } from "./schemas/product-range.schema";
import { Category, CategorySchema } from "./schemas/category.schema";
import { SkinConcern, SkinConcernSchema } from "./schemas/skin-concern.schema";
import { Product, ProductSchema } from "./schemas/product.schema";
import { ProductVariant, ProductVariantSchema } from "./schemas/product-variant.schema";
import { CatalogService } from "./catalog.service";
import { CatalogController } from "./catalog.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductRange.name, schema: ProductRangeSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SkinConcern.name, schema: SkinConcernSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [MongooseModule],
})
export class CatalogModule {}
