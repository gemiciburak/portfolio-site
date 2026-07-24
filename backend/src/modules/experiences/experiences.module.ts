import { Module } from '@nestjs/common';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesRepository } from './experiences.repository';
import { ExperiencesService } from './experiences.service';

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesService, ExperiencesRepository],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
