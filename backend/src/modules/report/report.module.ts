import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll, PayrollDetail, Employee, Payslip } from '../../entities';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({ imports: [TypeOrmModule.forFeature([Payroll, PayrollDetail, Employee, Payslip])], providers: [ReportService], controllers: [ReportController] })
export class ReportModule {}
