import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tax_config')
export class TaxConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @Column()
  ptkp_category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  ptkp_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  bracket_min: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  bracket_max: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number;

  @Column({ nullable: true })
  ter_category: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ter_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
