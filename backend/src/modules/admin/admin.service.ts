import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Company } from '../../entities/company.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
  ) {}

  async getAllTenants() { return this.companyRepo.find({ order: { created_at: 'DESC' } }); }

  async getAllUsers() { return this.userRepo.find({ relations: ['company'], order: { created_at: 'DESC' } }); }

  async createTenant(data: Partial<Company> & { admin_email: string; admin_password: string; admin_name: string }) {
    const company = await this.companyRepo.save(this.companyRepo.create({
      name: data.name, npwp: data.npwp, address: data.address,
      city: data.city, phone: data.phone, email: data.email, industry: data.industry,
    }));
    const hash = await bcrypt.hash(data.admin_password, 10);
    await this.userRepo.save(this.userRepo.create({
      company_id: company.id, email: data.admin_email,
      password_hash: hash, full_name: data.admin_name,
      role: 'company_admin',
    }));
    return company;
  }

  async deactivateTenant(id: string) { return this.companyRepo.update(id, { is_active: false }); }
  async activateTenant(id: string) { return this.companyRepo.update(id, { is_active: true }); }
}
