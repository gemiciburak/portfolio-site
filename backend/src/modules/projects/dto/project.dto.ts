import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string().nullable(),
  techStack: z.array(z.string()),
  highlights: z.array(z.string()),
  imageUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  liveUrl: z.string().nullable(),
  featured: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProjectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(slugPattern, 'Slug yalnızca küçük harf, rakam ve tire içerebilir'),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(400),
  description: z.string().max(20_000).nullable().optional(),
  techStack: z.array(z.string().min(1).max(40)).max(30).default([]),
  highlights: z.array(z.string().min(1).max(500)).max(20).default([]),
  imageUrl: z.string().max(500).nullable().optional(),
  githubUrl: z.string().url().max(500).nullable().optional(),
  liveUrl: z.string().url().max(500).nullable().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const updateProjectSchema = createProjectSchema.partial();

export const listProjectsQuerySchema = z.object({
  /** true → yalnızca ana sayfada gösterilenler. */
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export class ProjectDto extends createZodDto(projectSchema) {}
export class CreateProjectDto extends createZodDto(createProjectSchema) {}
export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
export class ListProjectsQueryDto extends createZodDto(listProjectsQuerySchema) {}

export type Project = z.infer<typeof projectSchema>;
