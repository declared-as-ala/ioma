import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { JwtPayload } from "../strategies/jwt.strategy";

// Pairs with OptionalJwtAuthGuard — request.user is undefined for guests.
export const OptionalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload | undefined;
  },
);
