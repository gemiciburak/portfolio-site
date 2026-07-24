import 'dotenv/config';
import * as argon2 from 'argon2';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { validateEnv } from '../../config/env';
import * as schema from './schema';
import { experiences, profile, projects, skillCategories, skills, users } from './schema';
import { experiencesSeed, profileSeed, projectsSeed, skillCategoriesSeed } from './seed-data';

/**
 * Idempotent seed: tekrar tekrar çalıştırılabilir.
 *
 * İçerik tabloları (profil, yetenekler, projeler, deneyimler) her çalıştırmada
 * seed-data.ts ile aynı hâle getirilir; admin kullanıcısı ise yalnızca yoksa
 * oluşturulur — mevcut parolayı asla ezmez.
 */
async function main(): Promise<void> {
  const env = validateEnv(process.env);
  const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
  const db = drizzle(pool, { schema });

  try {
    await db.transaction(async (tx) => {
      // ── Admin kullanıcısı ────────────────────────────────────────────────
      const email = env.ADMIN_EMAIL.toLowerCase();
      const [existingAdmin] = await tx.select().from(users).where(eq(users.email, email)).limit(1);

      if (existingAdmin) {
        console.log(`• Admin zaten var: ${email} (parola değiştirilmedi)`);
      } else {
        await tx.insert(users).values({
          email,
          name: env.ADMIN_NAME,
          passwordHash: await argon2.hash(env.ADMIN_PASSWORD, {
            type: argon2.argon2id,
            memoryCost: 19_456,
            timeCost: 2,
            parallelism: 1,
          }),
          role: 'ADMIN',
        });
        console.log(`✓ Admin oluşturuldu: ${email}`);
      }

      // ── Profil (tek satır) ───────────────────────────────────────────────
      await tx
        .insert(profile)
        .values({ id: 1, ...profileSeed, aboutParagraphs: [...profileSeed.aboutParagraphs], aboutTags: [...profileSeed.aboutTags] })
        .onConflictDoUpdate({
          target: profile.id,
          set: {
            ...profileSeed,
            aboutParagraphs: [...profileSeed.aboutParagraphs],
            aboutTags: [...profileSeed.aboutTags],
            updatedAt: new Date(),
          },
        });
      console.log('✓ Profil güncellendi');

      // ── Yetenekler ───────────────────────────────────────────────────────
      // Kategoriler başlığa göre eşlenir; yetenek listesi tümüyle yenilenir ki
      // seed-data.ts'ten çıkarılan bir yetenek veritabanında kalmasın.
      for (const category of skillCategoriesSeed) {
        const [existing] = await tx
          .select()
          .from(skillCategories)
          .where(eq(skillCategories.title, category.title))
          .limit(1);

        const categoryId = existing
          ? ((await tx
              .update(skillCategories)
              .set({ icon: category.icon, sortOrder: category.sortOrder, updatedAt: new Date() })
              .where(eq(skillCategories.id, existing.id))
              .returning())[0].id)
          : (
              await tx
                .insert(skillCategories)
                .values({
                  title: category.title,
                  icon: category.icon,
                  sortOrder: category.sortOrder,
                })
                .returning()
            )[0].id;

        await tx.delete(skills).where(eq(skills.categoryId, categoryId));
        await tx.insert(skills).values(
          category.skills.map((name, index) => ({
            categoryId,
            name,
            sortOrder: index,
          })),
        );
      }
      console.log(`✓ ${skillCategoriesSeed.length} yetenek kategorisi güncellendi`);

      // ── Projeler ─────────────────────────────────────────────────────────
      for (const project of projectsSeed) {
        const values = {
          ...project,
          techStack: [...project.techStack],
          highlights: [...project.highlights],
        };

        await tx
          .insert(projects)
          .values(values)
          .onConflictDoUpdate({
            target: projects.slug,
            set: { ...values, updatedAt: new Date() },
          });
      }
      console.log(`✓ ${projectsSeed.length} proje güncellendi`);

      // ── Deneyim ve eğitim ────────────────────────────────────────────────
      // Doğal anahtar yok; kayıtlar (organization, title) çiftiyle eşlenir.
      for (const experience of experiencesSeed) {
        const values = { ...experience, highlights: [...experience.highlights] };

        const [existing] = await tx
          .select()
          .from(experiences)
          .where(
            sql`${experiences.organization} = ${experience.organization} and ${experiences.title} = ${experience.title}`,
          )
          .limit(1);

        if (existing) {
          await tx
            .update(experiences)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(experiences.id, existing.id));
        } else {
          await tx.insert(experiences).values(values);
        }
      }
      console.log(`✓ ${experiencesSeed.length} deneyim/eğitim kaydı güncellendi`);
    });

    console.log('\nSeed tamamlandı.');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('✗ Seed başarısız:', error);
  process.exit(1);
});
