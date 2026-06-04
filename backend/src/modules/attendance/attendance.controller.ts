import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('shifts')
  getShifts(@Request() req) { return this.attendanceService.getShifts(req.user.company_id); }

  @Post('shifts')
  createShift(@Request() req, @Body() body: any) { return this.attendanceService.createShift(req.user.company_id, body); }

  @Get('attendance')
  findAll(@Request() req, @Query() query: any) { return this.attendanceService.findAll(req.user.company_id, query); }

  @Post('attendance')
  create(@Body() body: any) { return this.attendanceService.create(body.company_id || '', body); }

  @Post('attendance/bulk')
  bulkCreate(@Body() body: any[]) { return this.attendanceService.bulkCreate(body); }
}
