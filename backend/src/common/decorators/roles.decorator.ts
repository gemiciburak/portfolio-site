import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../core/database/schema/enums';

export const ROLES = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles);
