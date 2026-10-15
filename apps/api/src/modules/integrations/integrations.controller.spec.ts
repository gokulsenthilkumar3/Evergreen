import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../guards/roles.guard';
import { IntegrationsController } from './integrations.controller';

describe('integration administration boundary', () => {
  it.each(['preview', 'commit', 'history'] as const)(
    'restricts %s to company administrators',
    (action) => {
      const guard = new RolesGuard(new Reflector());
      const context = (role: string) =>
        ({
          getHandler: () => IntegrationsController.prototype[action],
          getClass: () => IntegrationsController,
          switchToHttp: () => ({
            getRequest: () => ({
              method: action === 'history' ? 'GET' : 'POST',
              user: { role },
            }),
          }),
        }) as unknown as ExecutionContext;
      expect(() => guard.canActivate(context('VIEWER'))).toThrow();
      expect(() => guard.canActivate(context('MODIFIER'))).toThrow();
      expect(guard.canActivate(context('ADMIN'))).toBe(true);
    },
  );
});
