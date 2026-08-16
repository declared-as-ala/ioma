import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { JwtPayload } from "../strategies/jwt.strategy";

// Cart/checkout must work for guests and logged-in customers alike (see
// SPRINTS.md Sprint 4 "guest can browse -> cart -> checkout"). Unlike
// JwtAuthGuard, a missing/invalid token here means "anonymous", not a 401 —
// request.user simply stays undefined and the resolved owner falls back to
// the guest-session header (see CartService.resolveOwner).
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  override handleRequest<TUser = JwtPayload>(
    _err: unknown,
    user: TUser | false,
  ): TUser | undefined {
    return user ? user : undefined;
  }
}
