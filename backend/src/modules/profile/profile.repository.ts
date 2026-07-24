import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import { profile, type ProfileRow } from '../../core/database/schema';

/** Kalıcılığın tek sahibi. HTTP exception fırlatmaz — yalnızca SQL bilir. */
@Injectable()
export class ProfileRepository {
  /** Tek satırlık tablo; kimlik daima 1. */
  private static readonly SINGLETON_ID = 1;

  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async find(): Promise<ProfileRow | undefined> {
    const [row] = await this.db
      .select()
      .from(profile)
      .where(eq(profile.id, ProfileRepository.SINGLETON_ID))
      .limit(1);

    return row;
  }

  async update(patch: Partial<ProfileRow>): Promise<ProfileRow | undefined> {
    const [row] = await this.db
      .update(profile)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(profile.id, ProfileRepository.SINGLETON_ID))
      .returning();

    return row;
  }
}
