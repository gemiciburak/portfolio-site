import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import { Public } from '../../common/decorators/public.decorator';
import { DRIZZLE } from '../../core/database/database.tokens';
import type { Database } from '../../core/database/database.types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Servis ve veritabanı sağlık kontrolü' })
  async check() {
    // Konteyner healthcheck'i buna bakar: veritabanına ulaşılamıyorsa
    // servis "ayakta" sayılmamalı.
    try {
      await this.db.execute(sql`select 1`);
    } catch {
      throw new ServiceUnavailableException('Veritabanına ulaşılamıyor');
    }

    return {
      status: 'ok',
      database: 'up',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
