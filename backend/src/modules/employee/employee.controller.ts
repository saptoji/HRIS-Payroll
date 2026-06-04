import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from './employee.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Get('employees')
  findAll(@Request() req, @Query() query: any) { return this.employeeService.findAll(req.user.company_id, query); }

  @Get('employees/:id')
  findOne(@Request() req, @Param('id') id: string) { return this.employeeService.findOne(req.user.company_id, id); }

  @Post('employees')
  create(@Request() req, @Body() body: any) { return this.employeeService.create(req.user.company_id, body); }

  @Put('employees/:id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) { return this.employeeService.update(req.user.company_id, id, body); }

  @Delete('employees/:id')
  remove(@Request() req, @Param('id') id: string) { return this.employeeService.remove(req.user.company_id, id); }

  @Post('employees/bulk')
  bulkCreate(@Request() req, @Body() body: any[]) { return this.employeeService.bulkCreate(req.user.company_id, body); }

  @Get('employees/:id/dependents')
  getDependents(@Param('id') id: string) { return this.employeeService.getDependents(id); }

  @Post('employees/:id/dependents')
  createDependent(@Param('id') id: string, @Body() body: any) { return this.employeeService.createDependent(id, body); }

  @Delete('employees/:id/dependents/:depId')
  removeDependent(@Param('depId') depId: string) { return this.employeeService.removeDependent(depId); }

  @Get('employees/:id/allowances')
  getAllowances(@Param('id') id: string) { return this.employeeService.getAllowances(id); }

  @Post('employees/:id/allowances')
  createAllowance(@Param('id') id: string, @Body() body: any) { return this.employeeService.createAllowance(id, body); }

  @Delete('employees/:id/allowances/:allowId')
  removeAllowance(@Param('allowId') allowId: string) { return this.employeeService.removeAllowance(allowId); }

  @Get('employees/:id/deductions')
  getDeductions(@Param('id') id: string) { return this.employeeService.getDeductions(id); }

  @Post('employees/:id/deductions')
  createDeduction(@Param('id') id: string, @Body() body: any) { return this.employeeService.createDeduction(id, body); }

  @Delete('employees/:id/deductions/:deductId')
  removeDeduction(@Param('deductId') deductId: string) { return this.employeeService.removeDeduction(deductId); }
}
