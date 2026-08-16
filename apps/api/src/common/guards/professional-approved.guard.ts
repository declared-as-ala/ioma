import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { JwtPayload } from "../../modules/auth/strategies/jwt.strategy";

export const PROFESSIONAL_APPROVED_KEY = "professional_approved";

/**
 * Guard that ensures the authenticated user has the professional_approved role.
 * Used on B2B portal endpoints — an unapproved professional cannot see
 * B2B pricing or place orders (CLAUDE.md security rules).
 */
@Injectable()
export class ProfessionalApprovedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(
      PROFESSIONAL_APPROVED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    if (!user) {
      throw new ForbiddenException("Authentication required for B2B portal.");
    }
    if (!user.roles.includes("professional_approved")) {
      throw new ForbiddenException(
        "B2B portal access requires an approved professional account.",
      );
    }
    return true;
  }
}
