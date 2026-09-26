import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY, normalizeRole } from '../utils/roles';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])) return true;
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // A route without @Roles is still protected. Reads require VIEWER,
    // ordinary changes require MODIFIER, and deletions require AUTHOR.
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const effectiveRoles = requiredRoles ||
      (method === 'GET' || method === 'HEAD' ? ['VIEWER'] :
        method === 'DELETE' ? ['AUTHOR'] : ['MODIFIER']);

    const { user } = request;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const userRole = normalizeRole(user.role);
    const allowedRoles = ROLE_HIERARCHY[userRole] || [userRole];
    const hasRole = effectiveRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    return true;
  }
}
