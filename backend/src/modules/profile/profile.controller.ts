import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiEnvelopeResponse } from '../../common/swagger/api-envelope.decorator';
import { ProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Portfolyo profil bilgisi (herkese açık)' })
  @ApiEnvelopeResponse(ProfileDto)
  get() {
    return this.service.get();
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Patch()
  @ApiOperation({ summary: 'Profil bilgisini güncelle' })
  @ApiEnvelopeResponse(ProfileDto)
  update(@Body() dto: UpdateProfileDto) {
    return this.service.update(dto);
  }
}
