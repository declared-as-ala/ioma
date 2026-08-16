import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomUUID } from "crypto";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "../../common/redis/redis.module";
import type { EnvConfig } from "../../config/env.validation";

interface RefreshTokenPayload {
  sub: string;
  family: string;
  jti: string;
}

const REFRESH_TTL_SECONDS_FALLBACK = 60 * 60 * 24 * 30; // 30 days

// Rotating refresh tokens with reuse detection, per SECURITY.md
// "Authentication & Sessions": each refresh consumes the current token and
// issues a new one in the same "family". If a token is replayed after
// rotation (i.e. it was stolen), the whole family is revoked and the user
// must log in again.
@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  private redisKey(family: string): string {
    return `refresh:family:${family}`;
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private ttlSeconds(): number {
    const raw = this.configService.get("JWT_REFRESH_TTL", { infer: true });
    const match = /^(\d+)([smhd])$/.exec(raw);
    if (!match) return REFRESH_TTL_SECONDS_FALLBACK;
    const value = Number(match[1]);
    const unit = match[2] as "s" | "m" | "h" | "d";
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
    return value * multiplier;
  }

  async issue(userId: string, family: string = randomUUID()): Promise<string> {
    const jti = randomUUID();
    const token = this.jwtService.sign(
      { sub: userId, family, jti } satisfies RefreshTokenPayload,
      {
        secret: this.configService.get("JWT_REFRESH_SECRET", { infer: true }),
        expiresIn: this.configService.get("JWT_REFRESH_TTL", { infer: true }),
      },
    );

    await this.redis.set(
      this.redisKey(family),
      this.hashToken(token),
      "EX",
      this.ttlSeconds(),
    );

    return token;
  }

  /**
   * Verifies and rotates a refresh token. Throws if invalid, expired, or
   * if reuse of an already-rotated token is detected (in which case the
   * entire token family is revoked as a precaution).
   */
  async rotate(token: string): Promise<{ userId: string; newToken: string }> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: this.configService.get("JWT_REFRESH_SECRET", { infer: true }),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const storedHash = await this.redis.get(this.redisKey(payload.family));
    const presentedHash = this.hashToken(token);

    if (!storedHash || storedHash !== presentedHash) {
      // Reuse of a rotated-out token, or an unknown family: revoke the
      // family outright and force re-authentication.
      await this.redis.del(this.redisKey(payload.family));
      throw new UnauthorizedException("Refresh token reuse detected — session revoked");
    }

    const newToken = await this.issue(payload.sub, payload.family);
    return { userId: payload.sub, newToken };
  }

  async revokeFamily(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: this.configService.get("JWT_REFRESH_SECRET", { infer: true }),
      });
      await this.redis.del(this.redisKey(payload.family));
    } catch {
      // Already invalid/expired — nothing to revoke.
    }
  }
}
