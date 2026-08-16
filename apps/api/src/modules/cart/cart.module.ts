import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Cart, CartSchema } from "./schemas/cart.schema";
import { PriceList, PriceListSchema } from "../professional/schemas/price-list.schema";
import { CatalogModule } from "../catalog/catalog.module";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: PriceList.name, schema: PriceListSchema },
    ]),
    CatalogModule,
    PassportModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [MongooseModule, CartService],
})
export class CartModule {}
