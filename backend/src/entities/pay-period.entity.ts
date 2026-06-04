import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PaySchedule } from './pay-schedule.entity';

@Entity('pay_periods')
export class PayPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pay_schedule_id: string;

  @ManyToOne(() => PaySchedule)
  @JoinColumn({ name: 'pay_schedule_id' })
  pay_schedule: PaySchedule;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'date' })
  pay_date: Date;

  @Column({ default: 'open' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
