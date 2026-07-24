import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { experienceKindEnum } from './enums';

export const experiences = pgTable(
  'experiences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: experienceKindEnum('kind').notNull(),

    /** Pozisyon ya da derece. */
    title: text('title').notNull(),
    /** Şirket ya da kurum. */
    organization: text('organization').notNull(),
    location: text('location'),

    /** "2026-06" gibi ay hassasiyetinde metin — gün bilgisi CV'de yok. */
    startDate: text('start_date').notNull(),
    /** null = hâlen devam ediyor. */
    endDate: text('end_date'),

    description: text('description'),
    highlights: jsonb('highlights').$type<string[]>().notNull().default([]),

    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('experiences_kind_idx').on(table.kind)],
);

export type ExperienceRow = typeof experiences.$inferSelect;
export type NewExperienceRow = typeof experiences.$inferInsert;
