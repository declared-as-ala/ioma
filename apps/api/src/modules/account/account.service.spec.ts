import { ForbiddenException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { AccountService } from "./account.service";
import { CustomerProfile } from "./schemas/customer-profile.schema";
import { Address } from "./schemas/address.schema";
import { AccountDeletionRequest } from "./schemas/account-deletion-request.schema";
import { UsersService } from "../users/users.service";

describe("AccountService ownership", () => {
  let service: AccountService;
  let profileModel: { findOne: jest.Mock; create: jest.Mock };
  let addressModel: {
    find: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    updateMany: jest.Mock;
  };
  let usersService: {
    findById: jest.Mock;
    updateNameAndLocale: jest.Mock;
  };

  beforeEach(async () => {
    profileModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    addressModel = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn().mockResolvedValue(undefined),
    };
    usersService = {
      findById: jest.fn(),
      updateNameAndLocale: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getModelToken(CustomerProfile.name), useValue: profileModel },
        { provide: getModelToken(Address.name), useValue: addressModel },
        {
          provide: getModelToken(AccountDeletionRequest.name),
          useValue: { findOne: jest.fn(), create: jest.fn() },
        },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = moduleRef.get(AccountService);
  });

  it("reads only the authenticated user's profile", async () => {
    usersService.findById.mockResolvedValue({
      email: "owner@example.com",
      firstName: "Owner",
      lastName: "One",
      locale: "en",
    });
    profileModel.findOne.mockResolvedValue({
      phone: null,
      dateOfBirth: null,
      skinConcerns: [],
      newsletterOptIn: false,
      preferredLocale: "en",
    });

    await service.getProfile("owner-user-id");

    expect(usersService.findById).toHaveBeenCalledWith("owner-user-id");
    expect(profileModel.findOne).toHaveBeenCalledWith({ userId: "owner-user-id" });
  });

  it("writes profile data only under the authenticated user's id", async () => {
    const profile = {
      phone: null,
      dateOfBirth: null,
      skinConcerns: [],
      newsletterOptIn: false,
      preferredLocale: "en",
      save: jest.fn().mockResolvedValue(undefined),
    };
    profileModel.findOne.mockResolvedValue(profile);
    usersService.findById.mockResolvedValue({
      email: "owner@example.com",
      firstName: "Updated",
      lastName: "Owner",
      locale: "fr",
    });

    await service.updateProfile("owner-user-id", {
      firstName: "Updated",
      lastName: "Owner",
      preferredLocale: "fr",
    });

    expect(usersService.updateNameAndLocale).toHaveBeenCalledWith("owner-user-id", {
      firstName: "Updated",
      lastName: "Owner",
      locale: "fr",
    });
    expect(profileModel.findOne).toHaveBeenCalledWith({ userId: "owner-user-id" });
  });

  it("lists addresses using an authenticated-user filter", () => {
    const lean = jest.fn().mockReturnValue([]);
    const sort = jest.fn().mockReturnValue({ lean });
    addressModel.find.mockReturnValue({ sort });

    service.listAddresses("owner-user-id");

    expect(addressModel.find).toHaveBeenCalledWith({ userId: "owner-user-id" });
  });

  it("always stamps a newly-created address with the authenticated user's id", async () => {
    const toObject = jest.fn().mockReturnValue({ _id: "address-id" });
    addressModel.create.mockResolvedValue({ toObject });

    await service.createAddress("owner-user-id", {
      type: "shipping",
      label: "Home",
      fullName: "Owner One",
      phone: "+971501234567",
      line1: "Owner Street",
      emirate: "DXB",
      city: "Dubai",
      isDefault: false,
    });

    expect(addressModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "owner-user-id", label: "Home" }),
    );
  });

  it("rejects updates to another user's address", async () => {
    addressModel.findById.mockResolvedValue({
      userId: { toString: () => "different-user-id" },
    });

    await expect(
      service.updateAddress("owner-user-id", "foreign-address-id", {
        type: "shipping",
        label: "Not mine",
        fullName: "Other User",
        phone: "+971501234567",
        line1: "Other Street",
        emirate: "DXB",
        city: "Dubai",
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("rejects deletion of another user's address", async () => {
    addressModel.findById.mockResolvedValue({
      userId: { toString: () => "different-user-id" },
    });

    await expect(
      service.deleteAddress("owner-user-id", "foreign-address-id"),
    ).rejects.toThrow(ForbiddenException);
  });
});
