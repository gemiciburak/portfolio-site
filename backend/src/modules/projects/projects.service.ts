import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { ProjectRow } from '../../core/database/schema';
import type {
  CreateProjectDto,
  ListProjectsQueryDto,
  Project,
  UpdateProjectDto,
} from './dto/project.dto';
import { ProjectsRepository } from './projects.repository';

/** DB satırı asla modül dışına çıkmaz; alan eklenirse burada açıkça geçer. */
function toDto(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    techStack: row.techStack,
    highlights: row.highlights,
    imageUrl: row.imageUrl,
    githubUrl: row.githubUrl,
    liveUrl: row.liveUrl,
    featured: row.featured,
    status: row.status,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class ProjectsService {
  constructor(private readonly repository: ProjectsRepository) {}

  /** Herkese açık liste — yalnızca yayımlanmış projeler. */
  async listPublic(query: ListProjectsQueryDto): Promise<Project[]> {
    const rows = await this.repository.findMany({
      publishedOnly: true,
      featured: query.featured,
      limit: query.limit,
    });

    return rows.map(toDto);
  }

  /** Admin listesi — taslaklar dâhil. */
  async listAll(): Promise<Project[]> {
    const rows = await this.repository.findMany({ publishedOnly: false });
    return rows.map(toDto);
  }

  async getBySlug(slug: string, includeDrafts = false): Promise<Project> {
    const row = await this.repository.findBySlug(slug, !includeDrafts);

    if (!row) {
      throw new NotFoundException('Proje bulunamadı');
    }

    return toDto(row);
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    if (await this.repository.slugExists(dto.slug)) {
      throw new ConflictException(`"${dto.slug}" slug'ı zaten kullanılıyor`);
    }

    const row = await this.repository.create(dto);
    return toDto(row);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Proje bulunamadı');
    }

    if (dto.slug && (await this.repository.slugExists(dto.slug, id))) {
      throw new ConflictException(`"${dto.slug}" slug'ı zaten kullanılıyor`);
    }

    const row = await this.repository.update(id, dto);

    if (!row) {
      throw new NotFoundException('Proje bulunamadı');
    }

    return toDto(row);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.remove(id))) {
      throw new NotFoundException('Proje bulunamadı');
    }
  }
}
