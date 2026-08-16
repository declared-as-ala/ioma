import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ProfessionalApprovedGuard } from "./professional-approved.guard";

describe("ProfessionalApprovedGuard", () => {
  let guard: ProfessionalApprovedGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ProfessionalApprovedGuard(reflector);
  });

  function createMockContext(
    user?: { roles: string[] },
    decoratorSet = true,
  ): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it("should allow access if handler does not require professional approval", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenException if user is unauthenticated", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException if user is customer/guest/pending/suspended (missing professional_approved role)", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

    const pendingContext = createMockContext({
      roles: ["customer", "professional_pending"],
    });
    expect(() => guard.canActivate(pendingContext)).toThrow(
      "B2B portal access requires an approved professional account.",
    );

    const suspendedContext = createMockContext({
      roles: ["customer", "professional_suspended"],
    });
    expect(() => guard.canActivate(suspendedContext)).toThrow(
      "B2B portal access requires an approved professional account.",
    );

    const customerContext = createMockContext({ roles: ["customer"] });
    expect(() => guard.canActivate(customerContext)).toThrow(
      "B2B portal access requires an approved professional account.",
    );
  });

  it("should allow access if user has professional_approved role", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const approvedContext = createMockContext({
      roles: ["customer", "professional_approved"],
    });

    expect(guard.canActivate(approvedContext)).toBe(true);
  });
});
