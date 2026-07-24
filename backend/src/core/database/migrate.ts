import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

/**
 * Migration'ları uygular. Konteynerde tek seferlik iş olarak çalışır:
 * şema güncel değilse uygular, sonra çıkar.
 */
async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL tanımlı değil');
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
    console.log('✓ Migration\'lar uygulandı');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('✗ Migration başarısız:', error);
  process.exit(1);
});
