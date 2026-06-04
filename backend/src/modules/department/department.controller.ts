import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DepartmentService } from './department.service';

@Controller('departments')
@UseGuards(AuthGuard('jwt'))
export class DepartmentController {
  constructor(private deptService: DepartmentService) {}

  @Get()
  findAll(@Request() req) { return this.deptService.findAll(req.user.company_id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.deptService.findOne(id); }

  @Post()
  create(@Request() req, @Body() body: any) { return this.deptService.create(req.user.company_id, body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.deptService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.deptService.remove(id); }
}
