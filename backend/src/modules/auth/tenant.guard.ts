import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user && user.company_id) {
      request.tenant_id = user.company_id;
    }
    return true;
  }
}

export const TENANT_KEY = 'tenant';
export const RequireTenant = () => SetMetadata(TENANT_KEY, true);
import { SetMetadata } from '@nestjs/common';
