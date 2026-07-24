import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import {
  type ExperienceKind,
  type ExperienceRow,
  type NewExperienceRow,
  experiences,
} from '../../core/database/schema';

@Injectable()
export class ExperiencesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  findMany(kind?: ExperienceKind): Promise<ExperienceRow[]> {
    return this.db
      .select()
      .from(experiences)
      .where(kind ? eq(experiences.kind, kind) : undefined)
      // En yeni deneyim üstte; sortOrder elle öne çekmeye izin verir.
      .orderBy(asc(experiences.sortOrder), desc(experiences.startDate));
  }

  async findById(id: string): Promise<ExperienceRow | undefined> {
    const [row] = await this.db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
    return row;
  }

  async create(values: NewExperienceRow): Promise<ExperienceRow> {
    const [row] = await this.db.insert(experiences).values(values).returning();
    return row;
  }

  async update(id: string, patch: Partial<NewExperienceRow>): Promise<ExperienceRow | undefined> {
    const [row] = await this.db
      .update(experiences)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(experiences.id, id))
      .returning();

    return row;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(experiences)
      .where(eq(experiences.id, id))
      .returning({ id: experiences.id });

    return deleted.length > 0;
  }
}
