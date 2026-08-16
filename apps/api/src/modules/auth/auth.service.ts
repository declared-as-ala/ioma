import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import type { AuthUser } from "@ioma/types";
import { UsersService } from "../users/users.service";
import { RefreshTokenService } from "./refresh-token.service";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";
import type { EnvConfig } from "../../config/env.validation";
import type { UserDocument } from "../users/schemas/user.schema";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      locale: dto.locale,
    });

    return this.issueSession(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException(
        "Account temporarily locked due to repeated failed login attempts",
      );
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      await this.usersService.recordFailedLogin(
        user.id,
        MAX_FAILED_LOGIN_ATTEMPTS,
        LOCK_MINUTES,
      );
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.usersService.recordSuccessfulLogin(user.id);
    return this.issueSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const { userId, newToken } = await this.refreshTokenService.rotate(refreshToken);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }
    const accessToken = this.signAccessToken(user);
    return {
      user: this.toAuthUser(user),
      accessToken,
      refreshToken: newToken,
      expiresIn: this.accessTokenTtlSeconds(),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeFamily(refreshToken);
  }

  private async issueSession(user: UserDocument): Promise<AuthResult> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.refreshTokenService.issue(user.id);
    return {
      user: this.toAuthUser(user),
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtlSeconds(),
    };
  }

  private signAccessToken(user: UserDocument): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, roles: user.roles },
      {
        secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
        expiresIn: this.configService.get("JWT_ACCESS_TTL", { infer: true }),
      },
    );
  }

  private accessTokenTtlSeconds(): number {
    const raw = this.configService.get("JWT_ACCESS_TTL", { infer: true });
    const match = /^(\d+)([smhd])$/.exec(raw);
    if (!match) return 900;
    const unit = match[2] as "s" | "m" | "h" | "d";
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
    return Number(match[1]) * multiplier;
  }

  private toAuthUser(user: UserDocument): AuthUser {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      locale: user.locale,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    };
  }
}
