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
  CreateProjectDto,
  ListProjectsQueryDto,
  ProjectDto,
  UpdateProjectDto,
} from './dto/project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Yayımlanmış projeleri listele' })
  @ApiEnvelopeResponse(ProjectDto, { isArray: true })
  list(@Query() query: ListProjectsQueryDto) {
    return this.service.listPublic(query);
  }

  // Statik segment, `:slug` parametresinden ÖNCE tanımlanmalı; aksi hâlde
  // "all" bir slug olarak yakalanır.
  @ApiBearerAuth()
  @Roles('ADMIN')
  @Get('all')
  @ApiOperation({ summary: 'Tüm projeler (taslaklar dâhil)' })
  @ApiEnvelopeResponse(ProjectDto, { isArray: true })
  listAll() {
    return this.service.listAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Proje detayı' })
  @ApiEnvelopeResponse(ProjectDto)
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Proje oluştur' })
  @ApiEnvelopeResponse(ProjectDto)
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Proje güncelle' })
  @ApiEnvelopeResponse(ProjectDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Proje sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.service.remove(id);
    return null;
  }
}
