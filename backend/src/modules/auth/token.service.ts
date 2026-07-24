import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { and, eq, lt, isNull } from 'drizzle-orm';
import { AppConfigService } from '../../config/app-config.service';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';
import { refreshTokens, revokedAccessTokens } from '../../core/database/schema';
import type { TokenPair } from './dto/auth.dto';

interface AccessPayload {
  sub: string;
  email: string;
  role: 'ADMIN';
  type: 'access';
  jti: string;
}

interface RefreshPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

/**
 * `expiresIn`, `ms` paketinin template literal tipini ("15m", "7d") bekler.
 * TTL'ler env'den düz string gelir; biçimleri Zod şemasında değil `ms` içinde
 * doğrulanır — geçersiz bir değer ilk token üretiminde patlar.
 */
type ExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

/**
 * Token yaşam döngüsünün tek sahibi: üretim, rotasyon, iptal.
 * AuthService akışları bilir, bu servis token'ları bilir.
 */
@Injectable()
export class TokenService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  /** Token'ın kendisi değil, SHA-256 hash'i saklanır. */
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async issuePair(user: { id: string; email: string; role: 'ADMIN' }): Promise<TokenPair> {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role, type: 'access', jti: accessJti },
      {
        secret: this.config.jwtAccessSecret,
        expiresIn: this.config.jwtAccessTtl as ExpiresIn,
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh', jti: refreshJti },
      {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshTtl as ExpiresIn,
      },
    );

    const decodedRefresh = this.jwt.decode<{ exp: number }>(refreshToken);
    const decodedAccess = this.jwt.decode<{ exp: number; iat: number }>(accessToken);

    await this.db.insert(refreshTokens).values({
      userId: user.id,
      jti: refreshJti,
      tokenHash: this.hash(refreshToken),
      expiresAt: new Date(decodedRefresh.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: decodedAccess.exp - decodedAccess.iat,
    };
  }

  /**
   * Rotasyon + yeniden kullanım tespiti: imzası geçerli ama kaydı bulunmayan
   * (ya da iptal edilmiş) bir refresh token daha önce tüketilmiş demektir.
   * Bu bir hırsızlık sinyalidir — kullanıcının tüm oturumları kapatılır.
   */
  async rotate(rawToken: string): Promise<{ userId: string }> {
    let payload: RefreshPayload;

    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(rawToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }

    const [record] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.jti, payload.jti))
      .limit(1);

    if (!record || record.revokedAt || record.tokenHash !== this.hash(rawToken)) {
      // Kayıt yoksa/iptalliyse token yeniden kullanılıyor demektir.
      await this.revokeAllForUser(payload.sub);
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, record.id));

    return { userId: record.userId };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const payload = this.jwt.decode<RefreshPayload | null>(rawToken);
    if (!payload?.jti) return;

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.jti, payload.jti), isNull(refreshTokens.revokedAt)));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }

  /** Logout: access token'ın jti'si doğal süresi dolana dek kara listede kalır. */
  async revokeAccessToken(jti: string, exp: number): Promise<void> {
    await this.db
      .insert(revokedAccessTokens)
      .values({ jti, expiresAt: new Date(exp * 1000) })
      .onConflictDoNothing();
  }

  async isAccessTokenRevoked(jti: string): Promise<boolean> {
    const [row] = await this.db
      .select({ jti: revokedAccessTokens.jti })
      .from(revokedAccessTokens)
      .where(eq(revokedAccessTokens.jti, jti))
      .limit(1);

    return Boolean(row);
  }

  /** Süresi geçmiş kayıtları temizler; tablolar sınırsız büyümez. */
  async pruneExpired(): Promise<void> {
    const now = new Date();
    await this.db.delete(revokedAccessTokens).where(lt(revokedAccessTokens.expiresAt, now));
    await this.db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
  }

  decodeAccessPayload(token: string): AccessPayload | null {
    return this.jwt.decode<AccessPayload | null>(token);
  }
}
