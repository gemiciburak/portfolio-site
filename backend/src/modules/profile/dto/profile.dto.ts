import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const optionalUrl = z.string().url().max(500).nullable().optional();

export const profileSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  heroDescription: z.string(),
  aboutParagraphs: z.array(z.string()),
  aboutTags: z.array(z.string()),
  email: z.string().email(),
  location: z.string().nullable(),
  githubUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  resumeUrl: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  updatedAt: z.string(),
});

export const updateProfileSchema = z
  .object({
    fullName: z.string().min(1).max(120),
    headline: z.string().min(1).max(160),
    heroDescription: z.string().min(1).max(1000),
    aboutParagraphs: z.array(z.string().min(1).max(2000)).max(10),
    aboutTags: z.array(z.string().min(1).max(40)).max(20),
    email: z.string().email().max(160),
    location: z.string().max(160).nullable(),
    githubUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    resumeUrl: optionalUrl,
    avatarUrl: z.string().max(500).nullable().optional(),
    metaTitle: z.string().max(160).nullable(),
    metaDescription: z.string().max(320).nullable(),
  })
  .partial();

export class ProfileDto extends createZodDto(profileSchema) {}
export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}

export type Profile = z.infer<typeof profileSchema>;
