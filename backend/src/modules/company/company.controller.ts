import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  findAll() { return this.companyService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.companyService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.companyService.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.companyService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.companyService.remove(id); }

  @Get(':id/departments')
  getDepartments(@Param('id') id: string) { return this.companyService.getDepartments(id); }

  @Post(':id/departments')
  createDepartment(@Param('id') id: string, @Body() body: any) { return this.companyService.createDepartment(id, body); }

  @Get(':id/branches')
  getBranches(@Param('id') id: string) { return this.companyService.getBranches(id); }

  @Post(':id/branches')
  createBranch(@Param('id') id: string, @Body() body: any) { return this.companyService.createBranch(id, body); }

  @Get(':id/cost-centers')
  getCostCenters(@Param('id') id: string) { return this.companyService.getCostCenters(id); }

  @Post(':id/cost-centers')
  createCostCenter(@Param('id') id: string, @Body() body: any) { return this.companyService.createCostCenter(id, body); }
}
