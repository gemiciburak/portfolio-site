import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { projectStatusEnum } from './enums';

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Detay sayfası URL'i: /projects/{slug} */
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    /** Kartta görünen kısa açıklama. */
    summary: text('summary').notNull(),
    /** Detay sayfasındaki uzun anlatım. */
    description: text('description'),

    techStack: jsonb('tech_stack').$type<string[]>().notNull().default([]),
    /** Detay sayfasındaki madde madde özellikler. */
    highlights: jsonb('highlights').$type<string[]>().notNull().default([]),

    imageUrl: text('image_url'),
    githubUrl: text('github_url'),
    liveUrl: text('live_url'),

    /** Ana sayfada gösterilir mi. */
    featured: boolean('featured').notNull().default(false),
    status: projectStatusEnum('status').notNull().default('PUBLISHED'),
    sortOrder: integer('sort_order').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('projects_status_idx').on(table.status),
    index('projects_featured_idx').on(table.featured),
  ],
);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
