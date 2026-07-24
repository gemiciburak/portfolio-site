import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createMessageSchema = z.object({
  name: z.string().trim().min(2, 'İsim en az 2 karakter olmalı').max(100),
  email: z.string().trim().toLowerCase().email('Geçerli bir e-posta adresi girin').max(160),
  message: z.string().trim().min(10, 'Mesaj en az 10 karakter olmalı').max(5000),
  /**
   * Honeypot: gerçek kullanıcı bu alanı göremez, bot doldurur.
   *
   * Şema burada kasıtlı olarak gevşek: doluluğu reddetseydik bot 400 alır ve
   * alanı boş bırakmayı öğrenirdi. Karar servise ait — istek başarılı görünür,
   * kayıt açılmaz.
   */
  website: z.string().max(200).optional(),
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z.coerce.boolean().optional(),
});

export class CreateMessageDto extends createZodDto(createMessageSchema) {}
export class MessageDto extends createZodDto(messageSchema) {}
export class ListMessagesQueryDto extends createZodDto(listMessagesQuerySchema) {}

export type Message = z.infer<typeof messageSchema>;
