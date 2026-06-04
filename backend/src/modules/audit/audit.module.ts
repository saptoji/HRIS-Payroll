import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({ imports: [TypeOrmModule.forFeature([AuditLog])], providers: [AuditService], controllers: [AuditController], exports: [AuditService] })
export class AuditModule {}
