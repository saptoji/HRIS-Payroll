import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bpjs_config')
export class BpjsConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @Column()
  type: string;

  @Column()
  component: string;

  @Column({ type: 'decimal', precision: 6, scale: 4 })
  employer_rate: number;

  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  employee_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  max_salary_cap: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
