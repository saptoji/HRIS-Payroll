import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayslipService } from './payslip.service';

@Controller('payslips')
@UseGuards(AuthGuard('jwt'))
export class PayslipController {
  constructor(private payslipService: PayslipService) {}

  @Get()
  findAll(@Request() req, @Query() query: any) { return this.payslipService.findAll(req.user.company_id, query); }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) { return this.payslipService.findOne(req.user.company_id, id); }
}
