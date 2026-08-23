import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import type { EnvConfig } from "../../config/env.validation";
import { StorageService } from "./storage.service";
import { MINIO_CLIENT } from "./storage.constants";

// Mirrors common/redis/redis.module.ts's pattern: a thin, globally-available
// wrapper around the raw client so every module that needs object storage
// (ai-analysis now, professional-application documents/protocols/training
// certificates in later sprints) depends on one place, not a scattered
// re-instantiated Client per module.
@Global()
@Module({
  providers: [
    {
      provide: MINIO_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => {
        const accessKey =
          config.get("MINIO_ACCESS_KEY", { infer: true }) || "ioma_minio_admin";
        const secretKey =
          config.get("MINIO_SECRET_KEY", { infer: true }) || "ioma_minio_secret_2026";
        return new Client({
          endPoint: config.get("MINIO_ENDPOINT", { infer: true }) || "minio",
          port: Number(config.get("MINIO_PORT", { infer: true }) || 9000),
          useSSL: String(config.get("MINIO_USE_SSL", { infer: true })) === "true",
          accessKey,
          secretKey,
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
