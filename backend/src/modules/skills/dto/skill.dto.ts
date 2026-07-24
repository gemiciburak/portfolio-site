import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const skillSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sortOrder: z.number().int(),
});

export const skillCategorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  icon: z.string(),
  sortOrder: z.number().int(),
  skills: z.array(skillSchema),
});

export const createSkillCategorySchema = z.object({
  title: z.string().min(1).max(80),
  icon: z.string().min(1).max(8),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  /** Kategori kendi yetenekleriyle birlikte tek çağrıda yazılır. */
  skills: z.array(z.string().min(1).max(60)).max(40).default([]),
});

export const updateSkillCategorySchema = createSkillCategorySchema.partial();

export class SkillDto extends createZodDto(skillSchema) {}
export class SkillCategoryDto extends createZodDto(skillCategorySchema) {}
export class CreateSkillCategoryDto extends createZodDto(createSkillCategorySchema) {}
export class UpdateSkillCategoryDto extends createZodDto(updateSkillCategorySchema) {}

export type SkillCategory = z.infer<typeof skillCategorySchema>;
