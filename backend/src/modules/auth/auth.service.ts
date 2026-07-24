import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import { users } from '../../core/database/schema';
import type { AuthResult, AuthUser, TokenPair } from './dto/auth.dto';
import { TokenService } from './token.service';

/**
 * OWASP'ın güncel ilk tercihi: Argon2id, bellek-ağırlıklı (GPU'ya dirençli).
 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

/**
 * Bilinmeyen e-postada da gerçek bir hash doğrulanır: cevap süresi "bu e-posta
 * kayıtlı mı?" sorusuna ipucu vermez. Karşılığı olan parola hiçbir yerde yok.
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$xws3v3pK55IdVC5Yx6NO1A$1MXs+EQGCjiNmc3deUzes5Ek/NVz+cdEdRzyF2TftvU';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tokens: TokenService,
  ) {}

  static hashPassword(password: string): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    const valid = user
      ? await argon2.verify(user.passwordHash, password)
      : await argon2.verify(DUMMY_HASH, password).catch(() => false);

    if (!user || !valid) {
      throw new UnauthorizedException('E-posta veya parola hatalı');
    }

    const tokens = await this.tokens.issuePair(user);
    return { user: this.toAuthUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const { userId } = await this.tokens.rotate(refreshToken);

    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return this.tokens.issuePair(user);
  }

  async logout(accessJti: string, accessExp: number, refreshToken?: string): Promise<void> {
    await this.tokens.revokeAccessToken(accessJti, accessExp);

    if (refreshToken) {
      await this.tokens.revokeRefreshToken(refreshToken);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new UnauthorizedException('Mevcut parola hatalı');
    }

    await this.db
      .update(users)
      .set({ passwordHash: await AuthService.hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Parola değişti — eski oturumların hepsi düşer.
    await this.tokens.revokeAllForUser(userId);
  }

  async findAuthUser(userId: string): Promise<AuthUser> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return this.toAuthUser(user);
  }

  /** DB satırı modül dışına çıkmaz; `passwordHash` yapısal olarak sızamaz. */
  private toAuthUser(user: { id: string; email: string; name: string; role: 'ADMIN' }): AuthUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
