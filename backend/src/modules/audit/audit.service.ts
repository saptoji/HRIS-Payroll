import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>) {}

  async log(data: { company_id: string; user_id: string; action: string; entity_type: string; entity_id: string; old_values?: any; new_values?: any; description?: string }) {
    return this.auditRepo.save(this.auditRepo.create(data));
  }

  async findAll(companyId: string, query: { page?: number; limit?: number; entity_type?: string }) {
    const { page = 1, limit = 50, entity_type } = query;
    const where: any = { company_id: companyId };
    if (entity_type) where.entity_type = entity_type;
    return this.auditRepo.find({
      where, relations: ['user'],
      skip: (page - 1) * limit, take: limit, order: { created_at: 'DESC' },
    });
  }
}
