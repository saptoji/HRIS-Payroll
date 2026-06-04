import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveType, LeaveBalance, LeaveRequest } from '../../entities';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';

@Module({ imports: [TypeOrmModule.forFeature([LeaveType, LeaveBalance, LeaveRequest])], providers: [LeaveService], controllers: [LeaveController] })
export class LeaveModule {}
