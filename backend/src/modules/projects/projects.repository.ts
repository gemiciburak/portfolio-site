import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import { type NewProjectRow, type ProjectRow, projects } from '../../core/database/schema';

@Injectable()
export class ProjectsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findMany(filters: {
    publishedOnly: boolean;
    featured?: boolean;
    limit?: number;
  }): Promise<ProjectRow[]> {
    const conditions: SQL[] = [];

    if (filters.publishedOnly) {
      conditions.push(eq(projects.status, 'PUBLISHED'));
    }

    if (filters.featured !== undefined) {
      conditions.push(eq(projects.featured, filters.featured));
    }

    const query = this.db
      .select()
      .from(projects)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(projects.sortOrder), asc(projects.title));

    return filters.limit ? query.limit(filters.limit) : query;
  }

  async findBySlug(slug: string, publishedOnly: boolean): Promise<ProjectRow | undefined> {
    const conditions: SQL[] = [eq(projects.slug, slug)];

    if (publishedOnly) {
      conditions.push(eq(projects.status, 'PUBLISHED'));
    }

    const [row] = await this.db
      .select()
      .from(projects)
      .where(and(...conditions))
      .limit(1);

    return row;
  }

  async findById(id: string): Promise<ProjectRow | undefined> {
    const [row] = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return row;
  }

  async create(values: NewProjectRow): Promise<ProjectRow> {
    const [row] = await this.db.insert(projects).values(values).returning();
    return row;
  }

  async update(id: string, patch: Partial<NewProjectRow>): Promise<ProjectRow | undefined> {
    const [row] = await this.db
      .update(projects)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    return row;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.db.delete(projects).where(eq(projects.id, id)).returning({
      id: projects.id,
    });

    return deleted.length > 0;
  }

  async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const row = await this.findBySlug(slug, false);
    return Boolean(row && row.id !== exceptId);
  }
}
