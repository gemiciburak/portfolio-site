import { z } from 'zod';

/**
 * Tüm ortam değişkenleri burada tanımlıdır. Geçersiz bir konfigürasyonda uygulama
 * açılmayı reddeder — yanlış yazılmış bir değişken production kazası değil,
 * başlangıç hatası olur.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  /** Ters proxy (Nginx) arkasında çalışırken 1; doğrudan sunumda 0. */
  TRUST_PROXY: z.coerce.boolean().default(false),

  DATABASE_URL: z.string().url(),
  /** Havuzdaki azami bağlantı sayısı. */
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  /**
   * İki ayrı sır: bir refresh token asla access token yerine geçemez.
   * 32 karakter alt sınırı, zayıf sırlarla production'a çıkmayı engeller.
   */
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  /** Virgülle ayrılmış allow-list. Boş bırakılırsa hiçbir origin'e izin verilmez. */
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  /** Genel istek limiti: TTL saniye içinde LIMIT istek. */
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  /** Yalnızca seed script'i tarafından kullanılır; ilk admin hesabını oluşturur. */
  ADMIN_EMAIL: z.string().email().default('admin@burakgemici.com.tr'),
  ADMIN_PASSWORD: z.string().min(12).default('ChangeMe_In_Production!'),
  ADMIN_NAME: z.string().default('Burak Gemici'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Ortam değişkenleri geçersiz:\n${issues}`);
  }

  return parsed.data;
}
