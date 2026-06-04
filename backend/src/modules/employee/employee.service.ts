import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { EmployeeDependent } from '../../entities/employee-dependent.entity';
import { EmployeeAllowance } from '../../entities/employee-allowance.entity';
import { EmployeeDeduction } from '../../entities/employee-deduction.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(EmployeeDependent) private depRepo: Repository<EmployeeDependent>,
    @InjectRepository(EmployeeAllowance) private allowRepo: Repository<EmployeeAllowance>,
    @InjectRepository(EmployeeDeduction) private deductRepo: Repository<EmployeeDeduction>,
  ) {}

  async findAll(companyId: string, query: { page?: number; limit?: number; search?: string; department_id?: string; status?: string }) {
    const { page = 1, limit = 25, search, department_id, status } = query;
    const where: any = { company_id: companyId };
    if (department_id) where.department_id = department_id;
    if (status) where.employment_status = status;
    if (search) {
      return this.empRepo.find({
        where: [
          { ...where, first_name: Like(`%${search}%`) },
          { ...where, last_name: Like(`%${search}%`) },
          { ...where, employee_number: Like(`%${search}%`) },
          { ...where, email: Like(`%${search}%`) },
        ],
        relations: ['department', 'branch', 'manager'],
        skip: (page - 1) * limit,
        take: limit,
        order: { first_name: 'ASC' },
      });
    }
    return this.empRepo.find({
      where, relations: ['department', 'branch', 'manager'],
      skip: (page - 1) * limit, take: limit, order: { first_name: 'ASC' },
    });
  }

  async findOne(companyId: string, id: string) {
    const emp = await this.empRepo.findOne({ where: { id, company_id: companyId }, relations: ['department', 'branch', 'manager'] });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async create(companyId: string, data: Partial<Employee>) {
    if (!data.employee_number) {
      const count = await this.empRepo.count({ where: { company_id: companyId } });
      data.employee_number = `EMP${String(count + 1).padStart(5, '0')}`;
    }
    return this.empRepo.save(this.empRepo.create({ ...data, company_id: companyId }));
  }

  async update(companyId: string, id: string, data: Partial<Employee>) {
    await this.findOne(companyId, id);
    return this.empRepo.update(id, data);
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    const now = new Date();
    return this.empRepo.update(id, { employment_status: 'inactive', termination_date: now });
  }

  async bulkCreate(companyId: string, employees: Partial<Employee>[]) {
    const count = await this.empRepo.count({ where: { company_id: companyId } });
    const records = employees.map((e, i) => this.empRepo.create({
      ...e, company_id: companyId,
      employee_number: e.employee_number || `EMP${String(count + i + 1).padStart(5, '0')}`,
    }));
    return this.empRepo.save(records);
  }

  async getDependents(employeeId: string) { return this.depRepo.find({ where: { employee_id: employeeId } }); }
  async createDependent(employeeId: string, data: Partial<EmployeeDependent>) { return this.depRepo.save(this.depRepo.create({ ...data, employee_id: employeeId })); }
  async removeDependent(id: string) { return this.depRepo.delete(id); }

  async getAllowances(employeeId: string) { return this.allowRepo.find({ where: { employee_id: employeeId } }); }
  async createAllowance(employeeId: string, data: Partial<EmployeeAllowance>) { return this.allowRepo.save(this.allowRepo.create({ ...data, employee_id: employeeId })); }
  async removeAllowance(id: string) { return this.allowRepo.delete(id); }

  async getDeductions(employeeId: string) { return this.deductRepo.find({ where: { employee_id: employeeId } }); }
  async createDeduction(employeeId: string, data: Partial<EmployeeDeduction>) { return this.deductRepo.save(this.deductRepo.create({ ...data, employee_id: employeeId })); }
  async removeDeduction(id: string) { return this.deductRepo.delete(id); }
}
