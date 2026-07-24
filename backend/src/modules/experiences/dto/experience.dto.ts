import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * "YYYY" veya "YYYY-MM". CV'de gün hassasiyeti yok; bazı kayıtlarda ay da yok
 * (ör. eğitim "2023"). Olmayan bir ayı uydurmak yerine şema ikisine de izin verir.
 */
const datePattern = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const monthString = z.string().regex(datePattern, 'Tarih YYYY veya YYYY-MM biçiminde olmalı');

export const experienceSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(['WORK', 'EDUCATION']),
  title: z.string(),
  organization: z.string(),
  location: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string().nullable(),
  highlights: z.array(z.string()),
  sortOrder: z.number().int(),
});

export const createExperienceSchema = z.object({
  kind: z.enum(['WORK', 'EDUCATION']),
  title: z.string().min(1).max(160),
  organization: z.string().min(1).max(160),
  location: z.string().max(160).nullable().optional(),
  startDate: monthString,
  /** null → hâlen devam ediyor. */
  endDate: monthString.nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  highlights: z.array(z.string().min(1).max(500)).max(20).default([]),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export const listExperiencesQuerySchema = z.object({
  kind: z.enum(['WORK', 'EDUCATION']).optional(),
});

export class ExperienceDto extends createZodDto(experienceSchema) {}
export class CreateExperienceDto extends createZodDto(createExperienceSchema) {}
export class UpdateExperienceDto extends createZodDto(updateExperienceSchema) {}
export class ListExperiencesQueryDto extends createZodDto(listExperiencesQuerySchema) {}

export type Experience = z.infer<typeof experienceSchema>;
