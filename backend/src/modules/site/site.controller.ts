import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ExperiencesService } from '../experiences/experiences.service';
import { ProfileService } from '../profile/profile.service';
import { ProjectsService } from '../projects/projects.service';
import { SkillsService } from '../skills/skills.service';

/**
 * Ana sayfanın ihtiyacı olan her şeyi tek istekte döner. Modüller birbirinden
 * habersiz kalır — bu controller yalnızca export edilmiş service'leri birleştirir.
 */
@ApiTags('Site')
@Controller('site')
export class SiteController {
  constructor(
    private readonly profile: ProfileService,
    private readonly skills: SkillsService,
    private readonly projects: ProjectsService,
    private readonly experiences: ExperiencesService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Ana sayfa içeriğinin tamamı (tek çağrı)' })
  async get() {
    const [profile, skills, projects, experiences] = await Promise.all([
      this.profile.get(),
      this.skills.list(),
      this.projects.listPublic({ featured: true }),
      this.experiences.list({}),
    ]);

    return { profile, skills, projects, experiences };
  }
}
