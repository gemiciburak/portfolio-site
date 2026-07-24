import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateSkillCategoryDto,
  SkillCategory,
  UpdateSkillCategoryDto,
} from './dto/skill.dto';
import { type CategoryWithSkills, SkillsRepository } from './skills.repository';

function toDto(row: CategoryWithSkills): SkillCategory {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    sortOrder: row.sortOrder,
    skills: row.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      sortOrder: skill.sortOrder,
    })),
  };
}

@Injectable()
export class SkillsService {
  constructor(private readonly repository: SkillsRepository) {}

  async list(): Promise<SkillCategory[]> {
    const rows = await this.repository.findAll();
    return rows.map(toDto);
  }

  async create(dto: CreateSkillCategoryDto): Promise<SkillCategory> {
    const id = await this.repository.create({
      title: dto.title,
      icon: dto.icon,
      sortOrder: dto.sortOrder,
      skills: dto.skills,
    });

    return this.getById(id);
  }

  async update(id: string, dto: UpdateSkillCategoryDto): Promise<SkillCategory> {
    if (!(await this.repository.update(id, dto))) {
      throw new NotFoundException('Yetenek kategorisi bulunamadı');
    }

    return this.getById(id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.remove(id))) {
      throw new NotFoundException('Yetenek kategorisi bulunamadı');
    }
  }

  private async getById(id: string): Promise<SkillCategory> {
    const row = await this.repository.findById(id);

    if (!row) {
      throw new NotFoundException('Yetenek kategorisi bulunamadı');
    }

    return toDto(row);
  }
}
