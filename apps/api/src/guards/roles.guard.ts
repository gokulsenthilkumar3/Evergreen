import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY, normalizeRole } from '../utils/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const userRole = normalizeRole(user.role);
    const allowedRoles = ROLE_HIERARCHY[userRole] || [userRole];
    const hasRole = requiredRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    return true;
  }
}
