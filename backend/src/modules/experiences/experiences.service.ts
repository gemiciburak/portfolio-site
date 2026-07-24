import { Injectable, NotFoundException } from '@nestjs/common';
import type { ExperienceRow } from '../../core/database/schema';
import type {
  CreateExperienceDto,
  Experience,
  ListExperiencesQueryDto,
  UpdateExperienceDto,
} from './dto/experience.dto';
import { ExperiencesRepository } from './experiences.repository';

function toDto(row: ExperienceRow): Experience {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    organization: row.organization,
    location: row.location,
    startDate: row.startDate,
    endDate: row.endDate,
    description: row.description,
    highlights: row.highlights,
    sortOrder: row.sortOrder,
  };
}

@Injectable()
export class ExperiencesService {
  constructor(private readonly repository: ExperiencesRepository) {}

  async list(query: ListExperiencesQueryDto): Promise<Experience[]> {
    const rows = await this.repository.findMany(query.kind);
    return rows.map(toDto);
  }

  async create(dto: CreateExperienceDto): Promise<Experience> {
    const row = await this.repository.create(dto);
    return toDto(row);
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<Experience> {
    const row = await this.repository.update(id, dto);

    if (!row) {
      throw new NotFoundException('Deneyim kaydı bulunamadı');
    }

    return toDto(row);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.remove(id))) {
      throw new NotFoundException('Deneyim kaydı bulunamadı');
    }
  }
}
