import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Parola gerekli'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token gerekli'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut parola gerekli'),
  newPassword: z
    .string()
    .min(12, 'Yeni parola en az 12 karakter olmalı')
    .max(128, 'Yeni parola en fazla 128 karakter olabilir'),
});

export class LoginDto extends createZodDto(loginSchema) {}
export class RefreshDto extends createZodDto(refreshSchema) {}
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.literal('ADMIN'),
});

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  /** Access token'ın kalan ömrü, saniye. */
  expiresIn: z.number().int(),
});

export const authResultSchema = z.object({
  user: authUserSchema,
  tokens: tokenPairSchema,
});

export class AuthUserDto extends createZodDto(authUserSchema) {}
export class TokenPairDto extends createZodDto(tokenPairSchema) {}
export class AuthResultDto extends createZodDto(authResultSchema) {}

export type AuthUser = z.infer<typeof authUserSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type AuthResult = z.infer<typeof authResultSchema>;
