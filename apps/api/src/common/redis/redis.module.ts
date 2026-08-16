import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import type { EnvConfig } from "../../config/env.validation";

export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => {
        return new Redis(config.get("REDIS_URL", { infer: true }));
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // Ensures the connection closes cleanly on `app.close()` (tests) and on
  // graceful shutdown (production, once main.ts calls
  // app.enableShutdownHooks()) instead of leaking an open TCP handle.
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
