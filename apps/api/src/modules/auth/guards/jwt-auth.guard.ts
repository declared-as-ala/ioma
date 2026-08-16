import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Enforces authentication server-side — see CLAUDE.md "never hide an action
// in the UI without also guarding it server-side". Role/permission guards
// (RolesGuard, ProfessionalApprovedGuard) compose on top of this one and
// land with the RBAC module in Sprint 10, once Role/Permission collections
// exist (see DATA_MODEL.md).
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
