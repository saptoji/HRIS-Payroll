import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('super_admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('tenants')
  getAllTenants() { return this.adminService.getAllTenants(); }

  @Get('users')
  getAllUsers() { return this.adminService.getAllUsers(); }

  @Post('tenants')
  createTenant(@Body() body: any) { return this.adminService.createTenant(body); }

  @Put('tenants/:id/deactivate')
  deactivateTenant(@Param('id') id: string) { return this.adminService.deactivateTenant(id); }

  @Put('tenants/:id/activate')
  activateTenant(@Param('id') id: string) { return this.adminService.activateTenant(id); }
}
