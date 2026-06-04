import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Company } from '../../entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({ imports: [TypeOrmModule.forFeature([User, Company])], providers: [AdminService], controllers: [AdminController] })
export class AdminModule {}
