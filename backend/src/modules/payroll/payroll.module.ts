import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll, PayrollDetail, Payslip, PaySchedule, PayPeriod, Employee, EmployeeAllowance, EmployeeDeduction, TaxConfig, BpjsConfig } from '../../entities';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, PayrollDetail, Payslip, PaySchedule, PayPeriod, Employee, EmployeeAllowance, EmployeeDeduction, TaxConfig, BpjsConfig]), ComplianceModule],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}
