import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payslip } from '../../entities/payslip.entity';

@Injectable()
export class PayslipService {
  constructor(@InjectRepository(Payslip) private payslipRepo: Repository<Payslip>) {}

  async findAll(companyId: string, query: { page?: number; limit?: number; employee_id?: string; payroll_id?: string }) {
    const { page = 1, limit = 25, employee_id, payroll_id } = query;
    const where: any = { company_id: companyId };
    if (employee_id) where.employee_id = employee_id;
    if (payroll_id) where.payroll_id = payroll_id;
    return this.payslipRepo.find({
      where, relations: ['employee', 'payroll'],
      skip: (page - 1) * limit, take: limit, order: { created_at: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string) {
    const p = await this.payslipRepo.findOne({ where: { id, company_id: companyId }, relations: ['employee', 'payroll'] });
    if (!p) throw new NotFoundException('Payslip not found');
    return p;
  }
}
