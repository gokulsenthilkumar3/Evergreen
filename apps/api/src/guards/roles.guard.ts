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
import { staffRouteAllowed } from '../utils/staff-access';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // A route without @Roles is still protected. Reads require VIEWER,
    // Ordinary changes require MODIFIER, while destructive changes are
    // reserved for ADMIN. This is the canonical three-role permission matrix.
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const effectiveRoles =
      requiredRoles ||
      (method === 'GET' || method === 'HEAD'
        ? ['VIEWER']
        : method === 'DELETE'
          ? ['ADMIN']
          : ['MODIFIER']);

    const { user } = request;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const userRole = normalizeRole(user.role);
    // Signed installation roles can narrow access; they never grant a user additional permissions.
    if (
      request.installationLicence &&
      !request.installationLicence.roles.includes(userRole)
    ) {
      throw new ForbiddenException(
        'Your staff role is not enabled by this installation licence',
      );
    }
    const allowedRoles = ROLE_HIERARCHY[userRole] || [userRole];
    const hasRole = effectiveRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    const route = String(request.route?.path || request.path || '');
    const ownSecurity = route === '/auth' || route.startsWith('/auth/') || route === '/sessions' || route.startsWith('/sessions/');
    if (!ownSecurity && !staffRouteAllowed(Boolean(user.scopedAccess), user.accessRules || [], method, route)) throw new ForbiddenException('This endpoint is not enabled for your staff account');
    return true;
  }
}
