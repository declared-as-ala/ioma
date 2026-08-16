import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { WishlistService } from "./wishlist.service";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";

@ApiTags("wishlist")
@ApiBearerAuth()
@Controller("wishlist")
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.wishlistService.list(user.sub);
  }

  @Post()
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddWishlistItemDto) {
    return this.wishlistService.add(user.sub, dto.sku);
  }

  @Delete(":sku")
  remove(@CurrentUser() user: JwtPayload, @Param("sku") sku: string) {
    return this.wishlistService.remove(user.sub, sku);
  }
}
