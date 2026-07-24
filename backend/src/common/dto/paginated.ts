import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class PaginationQueryDto extends createZodDto(paginationQuerySchema) {}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * İşaretleyici sınıf: controller bunu döndürünce TransformInterceptor içeriği
 * `data` ve `meta` olarak açar. Envelope kuralı tek yerde yaşar.
 */
export class PaginatedResult<T> {
  constructor(
    readonly items: T[],
    readonly meta: PaginationMeta,
  ) {}

  static from<T>(items: T[], totalItems: number, page: number, limit: number): PaginatedResult<T> {
    return new PaginatedResult(items, {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    });
  }
}
