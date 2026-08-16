import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CustomerProfile,
  CustomerProfileSchema,
} from "./schemas/customer-profile.schema";
import { Address, AddressSchema } from "./schemas/address.schema";
import {
  AccountDeletionRequest,
  AccountDeletionRequestSchema,
} from "./schemas/account-deletion-request.schema";
import { UsersModule } from "../users/users.module";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
      { name: Address.name, schema: AddressSchema },
      { name: AccountDeletionRequest.name, schema: AccountDeletionRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
