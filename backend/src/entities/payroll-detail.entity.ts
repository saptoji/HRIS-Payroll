import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Payroll } from './payroll.entity';
import { Employee } from './employee.entity';

@Entity('payroll_details')
export class PayrollDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payroll_id: string;

  @ManyToOne(() => Payroll)
  @JoinColumn({ name: 'payroll_id' })
  payroll: Payroll;

  @Column()
  employee_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  base_salary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_allowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_overtime: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  thr_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  gross_income: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_tk_jkk: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_tk_jkm: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_tk_jht_employer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_tk_jht_employee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_tk_jp_employer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_tk_jp_employee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_kes_employer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs_kes_employee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph21_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  other_deductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  net_pay: number;

  @CreateDateColumn()
  created_at: Date;
}
