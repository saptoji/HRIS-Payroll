import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { Department } from '../../entities/department.entity';
import { Branch } from '../../entities/branch.entity';
import { CostCenter } from '../../entities/cost-center.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(CostCenter) private ccRepo: Repository<CostCenter>,
  ) {}

  async findAll() { return this.companyRepo.find(); }
  async findOne(id: string) { const c = await this.companyRepo.findOne({ where: { id } }); if (!c) throw new NotFoundException('Company not found'); return c; }
  async create(data: Partial<Company>) { return this.companyRepo.save(this.companyRepo.create(data)); }
  async update(id: string, data: Partial<Company>) { await this.findOne(id); return this.companyRepo.update(id, data); }
  async remove(id: string) { await this.findOne(id); return this.companyRepo.update(id, { is_active: false }); }

  async getDepartments(companyId: string) { return this.deptRepo.find({ where: { company_id: companyId }, relations: ['parent'] }); }
  async createDepartment(companyId: string, data: Partial<Department>) { return this.deptRepo.save(this.deptRepo.create({ ...data, company_id: companyId })); }
  async updateDepartment(companyId: string, id: string, data: Partial<Department>) { return this.deptRepo.update(id, data); }

  async getBranches(companyId: string) { return this.branchRepo.find({ where: { company_id: companyId } }); }
  async createBranch(companyId: string, data: Partial<Branch>) { return this.branchRepo.save(this.branchRepo.create({ ...data, company_id: companyId })); }

  async getCostCenters(companyId: string) { return this.ccRepo.find({ where: { company_id: companyId } }); }
  async createCostCenter(companyId: string, data: Partial<CostCenter>) { return this.ccRepo.save(this.ccRepo.create({ ...data, company_id: companyId })); }
}
