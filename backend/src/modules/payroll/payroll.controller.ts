import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayrollService } from './payroll.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get('pay-schedules')
  getSchedules(@Request() req) { return this.payrollService.getSchedules(req.user.company_id); }

  @Post('pay-schedules')
  createSchedule(@Request() req, @Body() body: any) { return this.payrollService.createSchedule(req.user.company_id, body); }

  @Get('pay-schedules/:id/periods')
  getPeriods(@Param('id') id: string) { return this.payrollService.getPeriods(id); }

  @Post('pay-periods')
  createPeriod(@Body() body: any) { return this.payrollService.createPeriod(body); }

  @Get('payrolls')
  findAll(@Request() req) { return this.payrollService.findAll(req.user.company_id); }

  @Get('payrolls/:id')
  findOne(@Request() req, @Param('id') id: string) { return this.payrollService.findOne(req.user.company_id, id); }

  @Post('payrolls')
  create(@Request() req, @Body() body: any) { return this.payrollService.create(req.user.company_id, body); }

  @Post('payrolls/:id/calculate')
  calculate(@Request() req, @Param('id') id: string) { return this.payrollService.calculate(req.user.company_id, id, req.user.id); }

  @Post('payrolls/:id/approve')
  approve(@Request() req, @Param('id') id: string) { return this.payrollService.approve(req.user.company_id, id, req.user.id); }

  @Post('payrolls/:id/paid')
  markAsPaid(@Request() req, @Param('id') id: string) { return this.payrollService.markAsPaid(req.user.company_id, id, req.user.id); }

  @Get('payrolls/:id/details')
  getDetails(@Request() req, @Param('id') id: string) { return this.payrollService.getPayrollDetail(req.user.company_id, id); }
}
