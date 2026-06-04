import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { DepartmentModule } from './modules/department/department.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { PayslipModule } from './modules/payslip/payslip.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ReportModule } from './modules/report/report.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'hris_payroll'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC', 'true') === 'true',
        schema: config.get('DB_SCHEMA', 'public'),
      }),
    }),
    AuthModule, CompanyModule, EmployeeModule, DepartmentModule,
    PayrollModule, PayslipModule, AttendanceModule, LeaveModule,
    ComplianceModule, ReportModule, AuditModule, AdminModule,
  ],
})
export class AppModule {}
