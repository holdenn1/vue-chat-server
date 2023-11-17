import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([RefreshTokenStrategy.extractJWTFromCookie]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      //!  passReqToCallback: true, for req.get('Authorization').replace('Bearer', '').trim();
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.refresh_token) {
      return req.cookies.refresh_token;
    }
    return null;
  }

  validate(payload: any) {
    console.log(payload);

    return payload;
  }
}
