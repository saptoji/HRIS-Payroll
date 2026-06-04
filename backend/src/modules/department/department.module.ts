import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../../entities';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';

@Module({ imports: [TypeOrmModule.forFeature([Department])], providers: [DepartmentService], controllers: [DepartmentController] })
export class DepartmentModule {}
