import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxConfig, BpjsConfig } from '../../entities';
import { ComplianceService } from './compliance.service';
import { ComplianceConfigService } from './compliance-config.service';
import { ComplianceController } from './compliance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaxConfig, BpjsConfig])],
  providers: [ComplianceService, ComplianceConfigService],
  controllers: [ComplianceController],
  exports: [ComplianceService, ComplianceConfigService],
})
export class ComplianceModule {}
