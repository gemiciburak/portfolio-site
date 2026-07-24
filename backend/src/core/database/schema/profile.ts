import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Tek satırlık tablo (id daima 1). Portfolyonun sahibi tektir; ayrı bir tablo
 * yerine tekil satır, "hangi profil?" sorusunu şema düzeyinde ortadan kaldırır.
 */
export const profile = pgTable('profile', {
  id: integer('id').primaryKey().default(1),

  fullName: text('full_name').notNull(),
  /** Hero'daki küçük başlık — ör. "Full-Stack Developer". */
  headline: text('headline').notNull(),
  /** Hero'daki ana paragraf. */
  heroDescription: text('hero_description').notNull(),

  /** About bölümündeki paragraflar, sırayla. */
  aboutParagraphs: jsonb('about_paragraphs').$type<string[]>().notNull().default([]),
  /** About altındaki rozetler. */
  aboutTags: jsonb('about_tags').$type<string[]>().notNull().default([]),

  email: text('email').notNull(),
  location: text('location'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  resumeUrl: text('resume_url'),
  avatarUrl: text('avatar_url'),

  /** SEO: <title> ve meta description. */
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),

  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ProfileRow = typeof profile.$inferSelect;
export type NewProfileRow = typeof profile.$inferInsert;
