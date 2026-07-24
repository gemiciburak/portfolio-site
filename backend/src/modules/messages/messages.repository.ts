import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import { type MessageRow, type NewMessageRow, messages } from '../../core/database/schema';

@Injectable()
export class MessagesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(values: NewMessageRow): Promise<MessageRow> {
    const [row] = await this.db.insert(messages).values(values).returning();
    return row;
  }

  async findMany(filters: {
    page: number;
    limit: number;
    isRead?: boolean;
  }): Promise<{ rows: MessageRow[]; total: number }> {
    const where = filters.isRead === undefined ? undefined : eq(messages.isRead, filters.isRead);

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(messages)
        .where(where)
        .orderBy(desc(messages.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      this.db.select({ value: count() }).from(messages).where(where),
    ]);

    return { rows, total: totals?.value ?? 0 };
  }

  async countUnread(): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(messages)
      .where(eq(messages.isRead, false));

    return row?.value ?? 0;
  }

  async markRead(id: string, isRead: boolean): Promise<MessageRow | undefined> {
    const [row] = await this.db
      .update(messages)
      .set({ isRead })
      .where(eq(messages.id, id))
      .returning();

    return row;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning({ id: messages.id });

    return deleted.length > 0;
  }
}
