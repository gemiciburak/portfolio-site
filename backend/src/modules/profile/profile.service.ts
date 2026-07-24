import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProfileRow } from '../../core/database/schema';
import type { Profile, UpdateProfileDto } from './dto/profile.dto';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async get(): Promise<Profile> {
    const row = await this.repository.find();

    if (!row) {
      throw new NotFoundException('Profil bulunamadı — seed script çalıştırılmamış olabilir');
    }

    return ProfileService.toDto(row);
  }

  async update(dto: UpdateProfileDto): Promise<Profile> {
    const row = await this.repository.update(dto);

    if (!row) {
      throw new NotFoundException('Profil bulunamadı');
    }

    return ProfileService.toDto(row);
  }

  /** DB satırı asla modül dışına çıkmaz; alan eklenirse burada açıkça geçer. */
  private static toDto(row: ProfileRow): Profile {
    return {
      fullName: row.fullName,
      headline: row.headline,
      heroDescription: row.heroDescription,
      aboutParagraphs: row.aboutParagraphs,
      aboutTags: row.aboutTags,
      email: row.email,
      location: row.location,
      githubUrl: row.githubUrl,
      linkedinUrl: row.linkedinUrl,
      resumeUrl: row.resumeUrl,
      avatarUrl: row.avatarUrl,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
