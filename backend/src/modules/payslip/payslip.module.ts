import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payslip } from '../../entities';
import { PayslipService } from './payslip.service';
import { PayslipController } from './payslip.controller';

@Module({ imports: [TypeOrmModule.forFeature([Payslip])], providers: [PayslipService], controllers: [PayslipController] })
export class PayslipModule {}
