import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from '../../entities/leave-type.entity';
import { LeaveBalance } from '../../entities/leave-balance.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveType) private typeRepo: Repository<LeaveType>,
    @InjectRepository(LeaveBalance) private balanceRepo: Repository<LeaveBalance>,
    @InjectRepository(LeaveRequest) private requestRepo: Repository<LeaveRequest>,
  ) {}

  async getTypes(companyId: string) { return this.typeRepo.find({ where: { company_id: companyId, is_active: true } }); }
  async createType(companyId: string, data: Partial<LeaveType>) { return this.typeRepo.save(this.typeRepo.create({ ...data, company_id: companyId })); }

  async getBalances(employeeId: string) { return this.balanceRepo.find({ where: { employee_id: employeeId }, relations: ['leave_type'] }); }

  async findAll(companyId: string, query: { page?: number; limit?: number; employee_id?: string; status?: string }) {
    const { page = 1, limit = 25, employee_id, status } = query;
    const where: any = {};
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;
    return this.requestRepo.find({
      where, relations: ['employee', 'leave_type', 'approver'],
      skip: (page - 1) * limit, take: limit, order: { created_at: 'DESC' },
    });
  }

  async create(companyId: string, data: Partial<LeaveRequest>) {
    const balance = await this.balanceRepo.findOne({ where: { employee_id: data.employee_id, leave_type_id: data.leave_type_id } });
    if (balance && data.duration && balance.remaining < data.duration) {
      throw new BadRequestException('Insufficient leave balance');
    }
    return this.requestRepo.save(this.requestRepo.create(data));
  }

  async approve(id: string, userId: string) {
    const leave = await this.requestRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException();
    await this.requestRepo.update(id, { status: 'approved', approved_by: userId, approved_at: new Date() });
    const balance = await this.balanceRepo.findOne({ where: { employee_id: leave.employee_id, leave_type_id: leave.leave_type_id } });
    if (balance) {
      await this.balanceRepo.update(balance.id, { used: Number(balance.used) + leave.duration, remaining: Number(balance.remaining) - leave.duration });
    }
    return this.requestRepo.findOne({ where: { id }, relations: ['employee', 'leave_type'] });
  }

  async reject(id: string, reason: string) {
    await this.requestRepo.update(id, { status: 'rejected', rejection_reason: reason });
    return this.requestRepo.findOne({ where: { id }, relations: ['employee', 'leave_type'] });
  }
}
