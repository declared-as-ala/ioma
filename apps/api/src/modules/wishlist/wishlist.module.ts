import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Wishlist, WishlistSchema } from "./schemas/wishlist.schema";
import { CatalogModule } from "../catalog/catalog.module";
import { WishlistService } from "./wishlist.service";
import { WishlistController } from "./wishlist.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }]),
    CatalogModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
