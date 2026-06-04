import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'hris-payroll-jwt-secret-change-in-production',
    });
  }

  validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role, company_id: payload.company_id };
  }
}
