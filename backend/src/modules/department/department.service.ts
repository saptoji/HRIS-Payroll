import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(@InjectRepository(Department) private deptRepo: Repository<Department>) {}

  async findAll(companyId: string) { return this.deptRepo.find({ where: { company_id: companyId }, relations: ['parent'] }); }
  async findOne(id: string) { const d = await this.deptRepo.findOne({ where: { id }, relations: ['parent', 'children'] }); if (!d) throw new NotFoundException(); return d; }
  async create(companyId: string, data: Partial<Department>) { return this.deptRepo.save(this.deptRepo.create({ ...data, company_id: companyId })); }
  async update(id: string, data: Partial<Department>) { return this.deptRepo.update(id, data); }
  async remove(id: string) { return this.deptRepo.update(id, { is_active: false }); }
}
