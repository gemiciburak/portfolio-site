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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiEnvelopeResponse } from '../../common/swagger/api-envelope.decorator';
import {
  CreateSkillCategoryDto,
  SkillCategoryDto,
  UpdateSkillCategoryDto,
} from './dto/skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Yetenek kategorilerini listele' })
  @ApiEnvelopeResponse(SkillCategoryDto, { isArray: true })
  list() {
    return this.service.list();
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yetenek kategorisi oluştur' })
  @ApiEnvelopeResponse(SkillCategoryDto)
  create(@Body() dto: CreateSkillCategoryDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Yetenek kategorisi güncelle' })
  @ApiEnvelopeResponse(SkillCategoryDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSkillCategoryDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Yetenek kategorisi sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.service.remove(id);
    return null;
  }
}
