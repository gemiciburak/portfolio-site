import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../../config/app-config.service';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user';
import { TokenService } from '../token.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN';
  type: string;
  jti: string;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfigService,
    private readonly tokens: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtAccessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // `type` kontrolü: refresh token'ı Authorization header'ına koyup
    // access token gibi kullanmayı imkânsız kılar.
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Geçersiz token türü');
    }

    if (await this.tokens.isAccessTokenRevoked(payload.jti)) {
      throw new UnauthorizedException('Oturum sonlandırılmış');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
