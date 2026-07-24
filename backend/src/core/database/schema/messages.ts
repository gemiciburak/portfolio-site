import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * İletişim formu gönderileri. Herkese açık POST; okuma yalnızca admin'e ait.
 */
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),

    /**
     * Ham IP değil, tuzlanmış SHA-256 hash'i. Kötüye kullanım incelemesi için
     * yeterli, kişisel veriyi düz saklamamak için gerekli.
     */
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),

    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('messages_created_at_idx').on(table.createdAt),
    index('messages_is_read_idx').on(table.isRead),
  ],
);

export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;
