import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { PayrollDetail } from '../../entities/payroll-detail.entity';
import { Employee } from '../../entities/employee.entity';
import { Payslip } from '../../entities/payslip.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Payroll) private payrollRepo: Repository<Payroll>,
    @InjectRepository(PayrollDetail) private detailRepo: Repository<PayrollDetail>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
  ) {}

  async payrollSummary(companyId: string, query: { start_date?: string; end_date?: string }) {
    const where: any = { company_id: companyId };
    if (query.start_date && query.end_date) {
      where.created_at = Between(new Date(query.start_date), new Date(query.end_date));
    }
    const payrolls = await this.payrollRepo.find({ where, order: { created_at: 'DESC' } });
    return payrolls.map(p => ({
      id: p.id, period_id: p.pay_period_id, status: p.status,
      gross_total: Number(p.gross_total), deduction_total: Number(p.deduction_total),
      net_total: Number(p.net_total), pph21_total: Number(p.pph21_total),
      bpjs_employer: Number(p.bpjs_employer_total), bpjs_employee: Number(p.bpjs_employee_total),
      total_employees: p.total_employees, processed_at: p.processed_at,
    }));
  }

  async headcountReport(companyId: string) {
    const employees = await this.empRepo.find({ where: { company_id: companyId }, relations: ['department'] });
    const byDept: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const e of employees) {
      const dept = e.department?.name || 'Unknown';
      byDept[dept] = (byDept[dept] || 0) + 1;
      byType[e.employment_type] = (byType[e.employment_type] || 0) + 1;
      byStatus[e.employment_status] = (byStatus[e.employment_status] || 0) + 1;
    }
    return { total: employees.length, by_department: byDept, by_employment_type: byType, by_status: byStatus };
  }

  async pph21Report(companyId: string, year?: number) {
    const y = year || new Date().getFullYear();
    const details = await this.detailRepo.find({ relations: ['employee', 'payroll'] });
    return details
      .filter(d => d.employee?.company_id === companyId)
      .map(d => ({
        employee_number: d.employee?.employee_number,
        name: `${d.employee?.first_name} ${d.employee?.last_name}`,
        npwp: d.employee?.npwp,
        gross_income: Number(d.gross_income),
        pph21: Number(d.pph21_amount),
        payroll_id: d.payroll_id,
      }));
  }

  async bpjsReport(companyId: string) {
    const details = await this.detailRepo.find({ relations: ['employee', 'payroll'] });
    return details
      .filter(d => d.employee?.company_id === companyId)
      .map(d => ({
        employee_number: d.employee?.employee_number,
        name: `${d.employee?.first_name} ${d.employee?.last_name}`,
        bpjs_tk_employer: Number(d.bpjs_tk_jkk) + Number(d.bpjs_tk_jkm) + Number(d.bpjs_tk_jht_employer) + Number(d.bpjs_tk_jp_employer),
        bpjs_tk_employee: Number(d.bpjs_tk_jht_employee) + Number(d.bpjs_tk_jp_employee),
        bpjs_kes_employer: Number(d.bpjs_kes_employer),
        bpjs_kes_employee: Number(d.bpjs_kes_employee),
      }));
  }
}
