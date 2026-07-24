import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import {
  type SkillCategoryRow,
  type SkillRow,
  skillCategories,
  skills,
} from '../../core/database/schema';

export interface CategoryWithSkills extends SkillCategoryRow {
  skills: SkillRow[];
}

@Injectable()
export class SkillsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** Tek sorguda kategori + yetenekler; N+1 yok. */
  findAll(): Promise<CategoryWithSkills[]> {
    return this.db.query.skillCategories.findMany({
      orderBy: [asc(skillCategories.sortOrder), asc(skillCategories.title)],
      with: { skills: { orderBy: [asc(skills.sortOrder), asc(skills.name)] } },
    });
  }

  findById(id: string): Promise<CategoryWithSkills | undefined> {
    return this.db.query.skillCategories.findFirst({
      where: eq(skillCategories.id, id),
      with: { skills: { orderBy: [asc(skills.sortOrder), asc(skills.name)] } },
    });
  }

  /**
   * Kategori ve yetenekleri tek transaction'da yazılır: yarım yazılmış bir
   * kategori (yetenekleri eksik) hiçbir zaman görünmez.
   */
  async create(input: {
    title: string;
    icon: string;
    sortOrder: number;
    skills: string[];
  }): Promise<string> {
    return this.db.transaction(async (tx) => {
      const [category] = await tx
        .insert(skillCategories)
        .values({ title: input.title, icon: input.icon, sortOrder: input.sortOrder })
        .returning();

      if (input.skills.length) {
        await tx.insert(skills).values(
          input.skills.map((name, index) => ({
            categoryId: category.id,
            name,
            sortOrder: index,
          })),
        );
      }

      return category.id;
    });
  }

  async update(
    id: string,
    patch: { title?: string; icon?: string; sortOrder?: number; skills?: string[] },
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [category] = await tx
        .update(skillCategories)
        .set({
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
          ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
          updatedAt: new Date(),
        })
        .where(eq(skillCategories.id, id))
        .returning({ id: skillCategories.id });

      if (!category) return false;

      // Yetenek listesi verildiyse tümüyle değiştirilir — kısmi birleştirme
      // sıralamayı belirsizleştirirdi.
      if (patch.skills) {
        await tx.delete(skills).where(eq(skills.categoryId, id));

        if (patch.skills.length) {
          await tx
            .insert(skills)
            .values(patch.skills.map((name, index) => ({ categoryId: id, name, sortOrder: index })));
        }
      }

      return true;
    });
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(skillCategories)
      .where(eq(skillCategories.id, id))
      .returning({ id: skillCategories.id });

    return deleted.length > 0;
  }
}
