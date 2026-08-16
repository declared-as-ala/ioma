import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/guards/auth.decorators";
import { AuditService, type AuditLogListResponse } from "./audit.service";

@Controller("admin/audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("administrator", "super_administrator")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async listAuditLogs(
    @Query("action") action?: string,
    @Query("resource") resource?: string,
    @Query("actorEmail") actorEmail?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ): Promise<AuditLogListResponse> {
    return this.auditService.listAuditLogs({
      action,
      resource,
      actorEmail,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
