import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from '../../entities/attendance-record.entity';
import { Shift } from '../../entities/shift.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord) private attRepo: Repository<AttendanceRecord>,
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
  ) {}

  async getShifts(companyId: string) { return this.shiftRepo.find({ where: { company_id: companyId } }); }
  async createShift(companyId: string, data: Partial<Shift>) { return this.shiftRepo.save(this.shiftRepo.create({ ...data, company_id: companyId })); }

  async findAll(companyId: string, query: { page?: number; limit?: number; employee_id?: string; start_date?: string; end_date?: string }) {
    const { page = 1, limit = 25, employee_id, start_date, end_date } = query;
    const where: any = {};
    if (employee_id) where.employee_id = employee_id;
    return this.attRepo.find({
      where: {}, relations: ['employee'],
      skip: (page - 1) * limit, take: limit, order: { date: 'DESC' },
    });
  }

  async create(companyId: string, data: Partial<AttendanceRecord>) { return this.attRepo.save(this.attRepo.create(data)); }

  async bulkCreate(records: Partial<AttendanceRecord>[]) { return this.attRepo.save(records.map(r => this.attRepo.create(r))); }
}
