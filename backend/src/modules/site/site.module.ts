import { Module } from '@nestjs/common';
import { ExperiencesModule } from '../experiences/experiences.module';
import { ProfileModule } from '../profile/profile.module';
import { ProjectsModule } from '../projects/projects.module';
import { SkillsModule } from '../skills/skills.module';
import { SiteController } from './site.controller';

@Module({
  imports: [ProfileModule, SkillsModule, ProjectsModule, ExperiencesModule],
  controllers: [SiteController],
})
export class SiteModule {}
