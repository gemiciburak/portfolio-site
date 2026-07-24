import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiEnvelopeResponse } from '../../common/swagger/api-envelope.decorator';
import { CreateMessageDto, ListMessagesQueryDto, MessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Public()
  // İletişim formu spam'e en açık uç: saatte 5 gönderim.
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Mesajınız alındı, en kısa sürede dönüş yapacağım')
  @ApiOperation({ summary: 'İletişim formu gönder' })
  create(@Body() dto: CreateMessageDto, @Ip() ip: string, @Req() request: Request) {
    return this.service.create(dto, { ip, userAgent: request.headers['user-agent'] });
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Gelen mesajlar (sayfalı)' })
  @ApiEnvelopeResponse(MessageDto, { isArray: true, paginated: true })
  list(@Query() query: ListMessagesQueryDto) {
    return this.service.list(query);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Get('unread-count')
  @ApiOperation({ summary: 'Okunmamış mesaj sayısı' })
  async unreadCount(): Promise<{ count: number }> {
    return { count: await this.service.countUnread() };
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mesajı okundu/okunmadı işaretle' })
  @ApiEnvelopeResponse(MessageDto)
  markRead(@Param('id', ParseUUIDPipe) id: string, @Body() body: { isRead?: boolean }) {
    return this.service.markRead(id, body?.isRead ?? true);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Mesaj sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.service.remove(id);
    return null;
  }
}
