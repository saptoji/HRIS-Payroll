import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from './leave.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Get('leave-types')
  getTypes(@Request() req) { return this.leaveService.getTypes(req.user.company_id); }

  @Post('leave-types')
  createType(@Request() req, @Body() body: any) { return this.leaveService.createType(req.user.company_id, body); }

  @Get('leave-balances/:employeeId')
  getBalances(@Param('employeeId') employeeId: string) { return this.leaveService.getBalances(employeeId); }

  @Get('leave-requests')
  findAll(@Request() req, @Query() query: any) { return this.leaveService.findAll(req.user.company_id, query); }

  @Post('leave-requests')
  create(@Request() req, @Body() body: any) { return this.leaveService.create(req.user.company_id, body); }

  @Post('leave-requests/:id/approve')
  approve(@Param('id') id: string, @Request() req) { return this.leaveService.approve(id, req.user.id); }

  @Post('leave-requests/:id/reject')
  reject(@Param('id') id: string, @Body() body: { reason: string }) { return this.leaveService.reject(id, body.reason); }
}
