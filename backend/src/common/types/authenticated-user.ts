import type { UserRole } from '../../core/database/schema/enums';

/** JWT strategy'nin doğruladıktan sonra request'e iliştirdiği kullanıcı. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  /** Access token'ın kimliği — logout blacklist'i için gerekir. */
  jti: string;
  /** Access token'ın bitiş zamanı (epoch saniye). */
  exp: number;
}
