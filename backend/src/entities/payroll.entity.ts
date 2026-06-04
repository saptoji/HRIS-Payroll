import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { PayPeriod } from './pay-period.entity';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  pay_period_id: string;

  @ManyToOne(() => PayPeriod)
  @JoinColumn({ name: 'pay_period_id' })
  pay_period: PayPeriod;

  @Column({ default: 'draft' })
  status: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  gross_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  deduction_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  employer_tax_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  bpjs_employer_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  bpjs_employee_total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  pph21_total: number;

  @Column()
  total_employees: number;

  @Column({ nullable: true })
  processed_by: string;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ nullable: true })
  paid_by: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
