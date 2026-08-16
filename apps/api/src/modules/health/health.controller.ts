import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    const mongoState = this.connection.readyState === 1 ? "up" : "down";
    return {
      status: mongoState === "up" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      dependencies: {
        mongo: mongoState,
      },
    };
  }
}
