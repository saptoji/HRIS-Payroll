import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord, Shift } from '../../entities';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({ imports: [TypeOrmModule.forFeature([AttendanceRecord, Shift])], providers: [AttendanceService], controllers: [AttendanceController] })
export class AttendanceModule {}
