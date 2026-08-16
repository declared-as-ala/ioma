import type { Model, Types } from "mongoose";
import type { ProductDocument } from "./schemas/product.schema";
import type { ProductVariantDocument } from "./schemas/product-variant.schema";

// Shared by the standard-diagnosis rules engine and the AI-analysis
// processor — both need "given a recommended range, which published
// products/variants form the morning and evening routine" and must never
// answer that question two different ways.
export async function buildRoutineForRange(
  productModel: Model<ProductDocument>,
  variantModel: Model<ProductVariantDocument>,
  rangeId: Types.ObjectId,
): Promise<{ morningRoutine: Types.ObjectId[]; eveningRoutine: Types.ObjectId[] }> {
  const products = await productModel.find({ rangeId, status: "published" }).lean();
  const productIds = products.map((p) => p._id);
  const variants = await variantModel.find({ productId: { $in: productIds } }).lean();

  const firstVariantFor = (productId: Types.ObjectId) =>
    variants.find((v) => v.productId.toString() === productId.toString());

  const morningRoutine = products
    .filter((p) => p.routineStep === "morning" || p.routineStep === "both")
    .map((p) => firstVariantFor(p._id))
    .filter((v): v is NonNullable<typeof v> => !!v)
    .map((v) => v._id);

  const eveningRoutine = products
    .filter((p) => p.routineStep === "evening" || p.routineStep === "both")
    .map((p) => firstVariantFor(p._id))
    .filter((v): v is NonNullable<typeof v> => !!v)
    .map((v) => v._id);

  return { morningRoutine, eveningRoutine };
}
