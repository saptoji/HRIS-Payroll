import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('payroll-summary')
  payrollSummary(@Request() req, @Query() query: any) { return this.reportService.payrollSummary(req.user.company_id, query); }

  @Get('headcount')
  headcountReport(@Request() req) { return this.reportService.headcountReport(req.user.company_id); }

  @Get('pph21')
  pph21Report(@Request() req, @Query('year') year: string) { return this.reportService.pph21Report(req.user.company_id, year ? parseInt(year) : undefined); }

  @Get('bpjs')
  bpjsReport(@Request() req) { return this.reportService.bpjsReport(req.user.company_id); }
}
