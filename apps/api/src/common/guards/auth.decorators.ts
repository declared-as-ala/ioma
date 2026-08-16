import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../guards/roles.guard";
import { PROFESSIONAL_APPROVED_KEY } from "../guards/professional-approved.guard";

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const RequireProfessional = () => SetMetadata(PROFESSIONAL_APPROVED_KEY, true);
