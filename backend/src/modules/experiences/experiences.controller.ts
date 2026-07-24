import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiEnvelopeResponse } from '../../common/swagger/api-envelope.decorator';
import {
  CreateExperienceDto,
  ExperienceDto,
  ListExperiencesQueryDto,
  UpdateExperienceDto,
} from './dto/experience.dto';
import { ExperiencesService } from './experiences.service';

@ApiTags('Experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly service: ExperiencesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Deneyim ve eğitim kayıtları' })
  @ApiEnvelopeResponse(ExperienceDto, { isArray: true })
  list(@Query() query: ListExperiencesQueryDto) {
    return this.service.list(query);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deneyim kaydı oluştur' })
  @ApiEnvelopeResponse(ExperienceDto)
  create(@Body() dto: CreateExperienceDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Deneyim kaydı güncelle' })
  @ApiEnvelopeResponse(ExperienceDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExperienceDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Deneyim kaydı sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.service.remove(id);
    return null;
  }
}
