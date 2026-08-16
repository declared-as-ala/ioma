import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { AccountService } from "./account.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpsertAddressDto } from "./dto/upsert-address.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeletionRequestDto } from "./dto/deletion-request.dto";

@ApiTags("account")
@ApiBearerAuth()
@Controller("account")
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get("profile")
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.accountService.getProfile(user.sub);
  }

  @Patch("profile")
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.accountService.updateProfile(user.sub, dto);
  }

  @Get("addresses")
  listAddresses(@CurrentUser() user: JwtPayload) {
    return this.accountService.listAddresses(user.sub);
  }

  @Post("addresses")
  createAddress(@CurrentUser() user: JwtPayload, @Body() dto: UpsertAddressDto) {
    return this.accountService.createAddress(user.sub, dto);
  }

  @Patch("addresses/:id")
  updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpsertAddressDto,
  ) {
    return this.accountService.updateAddress(user.sub, id, dto);
  }

  @Delete("addresses/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ): Promise<void> {
    await this.accountService.deleteAddress(user.sub, id);
  }

  @Patch("password")
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.accountService.changePassword(user.sub, dto);
  }

  @Post("deletion-request")
  requestDeletion(@CurrentUser() user: JwtPayload, @Body() dto: DeletionRequestDto) {
    return this.accountService.requestDeletion(user.sub, dto);
  }
}
