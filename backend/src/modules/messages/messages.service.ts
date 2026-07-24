import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { PaginatedResult } from '../../common/dto/paginated';
import { AppConfigService } from '../../config/app-config.service';
import type { MessageRow } from '../../core/database/schema';
import type { CreateMessageDto, ListMessagesQueryDto, Message } from './dto/message.dto';
import { MessagesRepository } from './messages.repository';

/** `ipHash` ve `userAgent` DTO'da yok — dışarı hiç çıkmazlar. */
function toDto(row: MessageRow): Message {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly repository: MessagesRepository,
    private readonly config: AppConfigService,
  ) {}

  async create(
    dto: CreateMessageDto,
    context: { ip?: string; userAgent?: string },
  ): Promise<{ accepted: boolean }> {
    // Honeypot doldurulmuşsa bot'a başarı görüntüsü verilir ama kayıt açılmaz —
    // hata dönmek, bot'a alanı boş bırakmayı öğretirdi.
    if (dto.website) {
      this.logger.warn('Honeypot tetiklendi; mesaj kaydedilmedi');
      return { accepted: true };
    }

    await this.repository.create({
      name: dto.name,
      email: dto.email,
      message: dto.message,
      ipHash: context.ip ? this.hashIp(context.ip) : null,
      userAgent: context.userAgent?.slice(0, 500) ?? null,
    });

    return { accepted: true };
  }

  async list(query: ListMessagesQueryDto): Promise<PaginatedResult<Message>> {
    const { rows, total } = await this.repository.findMany(query);
    return PaginatedResult.from(rows.map(toDto), total, query.page, query.limit);
  }

  countUnread(): Promise<number> {
    return this.repository.countUnread();
  }

  async markRead(id: string, isRead: boolean): Promise<Message> {
    const row = await this.repository.markRead(id, isRead);

    if (!row) {
      throw new NotFoundException('Mesaj bulunamadı');
    }

    return toDto(row);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.remove(id))) {
      throw new NotFoundException('Mesaj bulunamadı');
    }
  }

  /**
   * IP düz saklanmaz. JWT sırrı anahtar olarak kullanılır: aynı IP tutarlı bir
   * hash üretir (kötüye kullanım incelenebilir), ham adres geri getirilemez.
   */
  private hashIp(ip: string): string {
    return createHmac('sha256', this.config.jwtAccessSecret).update(ip).digest('hex');
  }
}
