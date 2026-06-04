import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { PayrollDetail } from '../../entities/payroll-detail.entity';
import { Payslip } from '../../entities/payslip.entity';
import { PaySchedule } from '../../entities/pay-schedule.entity';
import { PayPeriod } from '../../entities/pay-period.entity';
import { Employee } from '../../entities/employee.entity';
import { EmployeeAllowance } from '../../entities/employee-allowance.entity';
import { EmployeeDeduction } from '../../entities/employee-deduction.entity';
import { EmployeeDependent } from '../../entities/employee-dependent.entity';
import { TaxConfig } from '../../entities/tax-config.entity';
import { BpjsConfig } from '../../entities/bpjs-config.entity';
import { ComplianceService } from '../compliance/compliance.service';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll) private payrollRepo: Repository<Payroll>,
    @InjectRepository(PayrollDetail) private detailRepo: Repository<PayrollDetail>,
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(PaySchedule) private scheduleRepo: Repository<PaySchedule>,
    @InjectRepository(PayPeriod) private periodRepo: Repository<PayPeriod>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(EmployeeAllowance) private allowRepo: Repository<EmployeeAllowance>,
    @InjectRepository(EmployeeDeduction) private deductRepo: Repository<EmployeeDeduction>,
    @InjectRepository(TaxConfig) private taxRepo: Repository<TaxConfig>,
    @InjectRepository(BpjsConfig) private bpjsRepo: Repository<BpjsConfig>,
    private complianceService: ComplianceService,
  ) {}

  async getSchedules(companyId: string) { return this.scheduleRepo.find({ where: { company_id: companyId } }); }
  async createSchedule(companyId: string, data: Partial<PaySchedule>) { return this.scheduleRepo.save(this.scheduleRepo.create({ ...data, company_id: companyId })); }

  async getPeriods(scheduleId: string) { return this.periodRepo.find({ where: { pay_schedule_id: scheduleId }, order: { start_date: 'DESC' } }); }
  async createPeriod(data: Partial<PayPeriod>) { return this.periodRepo.save(this.periodRepo.create(data)); }

  async findAll(companyId: string) {
    return this.payrollRepo.find({ where: { company_id: companyId }, relations: ['pay_period'], order: { created_at: 'DESC' } });
  }

  async findOne(companyId: string, id: string) {
    const p = await this.payrollRepo.findOne({ where: { id, company_id: companyId }, relations: ['pay_period'] });
    if (!p) throw new NotFoundException('Payroll not found');
    const details = await this.detailRepo.find({ where: { payroll_id: id }, relations: ['employee'] });
    return { ...p, details };
  }

  async create(companyId: string, data: { pay_period_id: string }) {
    const period = await this.periodRepo.findOne({ where: { id: data.pay_period_id } });
    if (!period) throw new NotFoundException('Pay period not found');
    const existing = await this.payrollRepo.findOne({ where: { company_id: companyId, pay_period_id: data.pay_period_id } });
    if (existing) throw new BadRequestException('Payroll already exists for this period');
    return this.payrollRepo.save(this.payrollRepo.create({ company_id: companyId, pay_period_id: data.pay_period_id, status: 'draft' }));
  }

  async calculate(companyId: string, payrollId: string, userId: string) {
    const payroll = await this.payrollRepo.findOne({ where: { id: payrollId, company_id: companyId } });
    if (!payroll || payroll.status !== 'draft') throw new BadRequestException('Payroll cannot be calculated');

    await this.detailRepo.delete({ payroll_id: payrollId });

    const employees = await this.empRepo.find({ where: { company_id: companyId, employment_status: 'active' }, relations: ['department'] });
    const year = new Date().getFullYear();
    const taxConfigs = await this.taxRepo.find({ where: { year } });
    const bpjsConfigs = await this.bpjsRepo.find({ where: { year } });

    let grossTotal = 0, deductionTotal = 0, netTotal = 0;
    let employerTaxTotal = 0, bpjsEmployerTotal = 0, bpjsEmployeeTotal = 0, pph21Total = 0;

    for (const emp of employees) {
      const allowances = await this.allowRepo.find({ where: { employee_id: emp.id, is_active: true } });
      const deductions = await this.deductRepo.find({ where: { employee_id: emp.id, is_active: true } });
      const totalAllow = allowances.reduce((s, a) => s + Number(a.amount), 0);
      const totalDeduct = deductions.reduce((s, d) => s + Number(d.amount), 0);

      const baseSalary = Number(emp.base_salary);
      const grossIncome = baseSalary + totalAllow;

      let bpjsTkJkk = 0, bpjsTkJkm = 0, bpjsTkJhtEmp = 0, bpjsTkJhtEmpl = 0;
      let bpjsTkJpEmp = 0, bpjsTkJpEmpl = 0, bpjsKesEmp = 0, bpjsKesEmpl = 0;

      if (emp.is_bpjs_tk) {
        const tk = bpjsConfigs.filter(b => b.type === 'tk');
        bpjsTkJkk = baseSalary * (Number(tk.find(b => b.component === 'jkk')?.employer_rate) || 0);
        bpjsTkJkm = baseSalary * (Number(tk.find(b => b.component === 'jkm')?.employer_rate) || 0);
        bpjsTkJhtEmpl = baseSalary * (Number(tk.find(b => b.component === 'jht')?.employer_rate) || 0);
        bpjsTkJhtEmp = baseSalary * (Number(tk.find(b => b.component === 'jht')?.employee_rate) || 0);
        bpjsTkJpEmpl = baseSalary * (Number(tk.find(b => b.component === 'jp')?.employer_rate) || 0);
        bpjsTkJpEmp = baseSalary * (Number(tk.find(b => b.component === 'jp')?.employee_rate) || 0);
      }

      if (emp.is_bpjs_kes) {
        const kes = bpjsConfigs.find(b => b.type === 'kes');
        const cap = Number(kes?.max_salary_cap || 12000000);
        const effectiveSalary = Math.min(baseSalary, cap);
        bpjsKesEmpl = effectiveSalary * (Number(kes?.employer_rate) || 0);
        bpjsKesEmp = effectiveSalary * (Number(kes?.employee_rate) || 0);
      }

      const pph21 = this.complianceService.calculatePPh21(baseSalary, totalAllow, totalDeduct, emp, taxConfigs);

      const totalBpjsEmployee = bpjsTkJhtEmp + bpjsTkJpEmp + bpjsKesEmp;
      const netPay = grossIncome - totalBpjsEmployee - pph21 - totalDeduct;

      await this.detailRepo.save(this.detailRepo.create({
        payroll_id: payrollId, employee_id: emp.id,
        base_salary: baseSalary, total_allowances: totalAllow, gross_income: grossIncome,
        bpjs_tk_jkk: bpjsTkJkk, bpjs_tk_jkm: bpjsTkJkm,
        bpjs_tk_jht_employer: bpjsTkJhtEmpl, bpjs_tk_jht_employee: bpjsTkJhtEmp,
        bpjs_tk_jp_employer: bpjsTkJpEmpl, bpjs_tk_jp_employee: bpjsTkJpEmp,
        bpjs_kes_employer: bpjsKesEmpl, bpjs_kes_employee: bpjsKesEmp,
        pph21_amount: pph21, other_deductions: totalDeduct, net_pay: netPay,
      }));

      grossTotal += grossIncome;
      employerTaxTotal += bpjsTkJkk + bpjsTkJkm + bpjsTkJhtEmpl + bpjsTkJpEmpl + bpjsKesEmpl;
      bpjsEmployerTotal += bpjsTkJkk + bpjsTkJkm + bpjsTkJhtEmpl + bpjsTkJpEmpl + bpjsKesEmpl;
      bpjsEmployeeTotal += totalBpjsEmployee;
      pph21Total += pph21;
      deductionTotal += totalBpjsEmployee + pph21 + totalDeduct;
      netTotal += netPay;
    }

    await this.payrollRepo.update(payrollId, {
      status: 'calculated', gross_total: grossTotal, deduction_total: deductionTotal,
      net_total: netTotal, total_employees: employees.length,
      employer_tax_total: employerTaxTotal, bpjs_employer_total: bpjsEmployerTotal,
      bpjs_employee_total: bpjsEmployeeTotal, pph21_total: pph21Total,
      processed_by: userId, processed_at: new Date(),
    });

    return this.findOne(companyId, payrollId);
  }

  async approve(companyId: string, payrollId: string, userId: string) {
    const payroll = await this.payrollRepo.findOne({ where: { id: payrollId, company_id: companyId } });
    if (!payroll || payroll.status !== 'calculated') throw new BadRequestException('Payroll must be calculated first');
    await this.payrollRepo.update(payrollId, { status: 'approved', approved_by: userId, approved_at: new Date() });
    return this.findOne(companyId, payrollId);
  }

  async markAsPaid(companyId: string, payrollId: string, userId: string) {
    const payroll = await this.payrollRepo.findOne({ where: { id: payrollId, company_id: companyId } });
    if (!payroll || payroll.status !== 'approved') throw new BadRequestException('Payroll must be approved first');
    await this.payrollRepo.update(payrollId, { status: 'paid', paid_by: userId, paid_at: new Date() });
    await this.generatePayslips(companyId, payrollId);
    return this.findOne(companyId, payrollId);
  }

  async generatePayslips(companyId: string, payrollId: string) {
    const details = await this.detailRepo.find({ where: { payroll_id: payrollId } });
    const payroll = await this.payrollRepo.findOne({ where: { id: payrollId } });
    let counter = 1;

    for (const d of details) {
      const totalDeductions = Number(d.bpjs_tk_jht_employee) + Number(d.bpjs_tk_jp_employee) + Number(d.bpjs_kes_employee) + Number(d.pph21_amount) + Number(d.other_deductions);
      await this.payslipRepo.save(this.payslipRepo.create({
        company_id: companyId, payroll_id: payrollId, employee_id: d.employee_id,
        payslip_number: `PS-${payrollId.substring(0, 8)}-${String(counter++).padStart(4, '0')}`,
        base_salary: d.base_salary, total_allowances: d.total_allowances, gross_income: d.gross_income,
        bpjs_tk_jht_employee: d.bpjs_tk_jht_employee, bpjs_tk_jp_employee: d.bpjs_tk_jp_employee,
        bpjs_kes_employee: d.bpjs_kes_employee, pph21_amount: d.pph21_amount,
        other_deductions: d.other_deductions, total_deductions: totalDeductions, net_pay: d.net_pay,
      }));
    }
  }

  async getPayrollDetail(companyId: string, payrollId: string) {
    return this.detailRepo.find({ where: { payroll_id: payrollId }, relations: ['employee', 'employee.department'] });
  }
}
