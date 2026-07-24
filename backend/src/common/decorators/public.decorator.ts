import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/**
 * JwtAuthGuard globaldir — varsayılan olarak her route korumalıdır.
 * Herkese açık uçlar bu dekoratörle açıkça istisna edilir.
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);
