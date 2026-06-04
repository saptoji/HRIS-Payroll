import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComplianceConfigService } from './compliance-config.service';

@Controller('compliance')
@UseGuards(AuthGuard('jwt'))
export class ComplianceController {
  constructor(private configService: ComplianceConfigService) {}

  @Get('tax-config')
  getTaxConfigs(@Query('year') year: string) { return this.configService.getTaxConfigs(year ? parseInt(year) : undefined); }

  @Get('bpjs-config')
  getBpjsConfigs(@Query('year') year: string) { return this.configService.getBpjsConfigs(year ? parseInt(year) : undefined); }

  @Post('tax-config')
  createTaxConfig(@Body() body: any) { return this.configService.createTaxConfig(body); }

  @Post('bpjs-config')
  createBpjsConfig(@Body() body: any) { return this.configService.createBpjsConfig(body); }

  @Post('seed-defaults')
  seedDefaults() { return this.configService.seedDefaults(); }
}
