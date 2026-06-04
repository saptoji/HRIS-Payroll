import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email, is_active: true } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, company_id: user.company_id };
    const access_token = this.jwtService.sign(payload, { expiresIn: '24h' });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: '7d',
    });

    await this.userRepo.update(user.id, { last_login: new Date() });
    return { access_token, refresh_token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, company_id: user.company_id } };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_JWT_SECRET });
      const user = await this.userRepo.findOne({ where: { id: payload.sub, is_active: true } });
      if (!user) throw new UnauthorizedException();
      const newPayload = { sub: user.id, email: user.email, role: user.role, company_id: user.company_id };
      return { access_token: this.jwtService.sign(newPayload, { expiresIn: '24h' }) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async createUser(data: { email: string; password: string; full_name: string; role: string; company_id?: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.userRepo.save(this.userRepo.create({ ...data, password_hash: hash }));
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['company'] });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, full_name: user.full_name, role: user.role, company_id: user.company_id };
  }
}
