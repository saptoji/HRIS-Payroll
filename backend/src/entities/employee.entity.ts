import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { Branch } from './branch.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ unique: true })
  employee_number: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  marital_status: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  religion: string;

  @Column({ nullable: true })
  id_number: string;

  @Column({ nullable: true })
  npwp: string;

  @Column({ nullable: true })
  bpjs_tk_no: string;

  @Column({ nullable: true })
  bpjs_kes_no: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ type: 'date', nullable: true })
  termination_date: Date;

  @Column({ default: 'permanent' })
  employment_type: string;

  @Column({ default: 'active' })
  employment_status: string;

  @Column({ nullable: true })
  department_id: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ nullable: true })
  branch_id: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ nullable: true })
  job_title: string;

  @Column({ nullable: true })
  grade_id: string;

  @Column({ nullable: true })
  manager_id: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: true })
  bank_account: string;

  @Column({ nullable: true })
  bank_holder: string;

  @Column({ nullable: true })
  ptkp_category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  base_salary: number;

  @Column({ nullable: true })
  tax_method: string;

  @Column({ default: false })
  is_bpjs_tk: boolean;

  @Column({ default: false })
  is_bpjs_kes: boolean;

  @Column({ default: false })
  is_jht: boolean;

  @Column({ default: false })
  is_jp: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
