import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN']);

/** Zaman çizelgesi tek tabloda tutulur; iki tür aynı alanları paylaşır. */
export const experienceKindEnum = pgEnum('experience_kind', ['WORK', 'EDUCATION']);

export const projectStatusEnum = pgEnum('project_status', ['DRAFT', 'PUBLISHED']);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type ExperienceKind = (typeof experienceKindEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
