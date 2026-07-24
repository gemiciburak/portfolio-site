import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env';

/**
 * Env'e tipli erişim. Modüller `process.env`'e hiç dokunmaz; adı değişen bir
 * değişken çalışma zamanı sürprizi değil, derleme hatası olur.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  private get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.get('PORT');
  }

  get trustProxy(): boolean {
    return this.get('TRUST_PROXY');
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get databasePoolMax(): number {
    return this.get('DATABASE_POOL_MAX');
  }

  get jwtAccessSecret(): string {
    return this.get('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.get('JWT_REFRESH_SECRET');
  }

  get jwtAccessTtl(): string {
    return this.get('JWT_ACCESS_TTL');
  }

  get jwtRefreshTtl(): string {
    return this.get('JWT_REFRESH_TTL');
  }

  get corsOrigins(): string[] {
    return this.get('CORS_ORIGINS');
  }

  get throttleTtl(): number {
    return this.get('THROTTLE_TTL');
  }

  get throttleLimit(): number {
    return this.get('THROTTLE_LIMIT');
  }

  get swaggerEnabled(): boolean {
    return this.get('SWAGGER_ENABLED');
  }

  get logLevel(): Env['LOG_LEVEL'] {
    return this.get('LOG_LEVEL');
  }
}
