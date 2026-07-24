import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiEnvelopeResponse } from '../../common/swagger/api-envelope.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AuthService } from './auth.service';
import {
  AuthResultDto,
  AuthUserDto,
  ChangePasswordDto,
  LoginDto,
  RefreshDto,
  TokenPairDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  // Kaba kuvvete karşı route bazlı sıkı limit — global limitin çok altında.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Giriş başarılı')
  @ApiOperation({ summary: 'Admin girişi' })
  @ApiEnvelopeResponse(AuthResultDto)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token yenilendi')
  @ApiOperation({ summary: 'Access token yenile (refresh token rotasyonlu)' })
  @ApiEnvelopeResponse(TokenPairDto)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Çıkış yapıldı')
  @ApiOperation({ summary: 'Oturumu kapat' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<RefreshDto>,
  ): Promise<null> {
    await this.auth.logout(user.jti, user.exp, body?.refreshToken);
    return null;
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Oturum açmış kullanıcı' })
  @ApiEnvelopeResponse(AuthUserDto)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.findAuthUser(user.id);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Parola güncellendi, tekrar giriş yapın')
  @ApiOperation({ summary: 'Parola değiştir (tüm oturumları kapatır)' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<null> {
    await this.auth.changePassword(user.id, dto.currentPassword, dto.newPassword);
    return null;
  }
}
