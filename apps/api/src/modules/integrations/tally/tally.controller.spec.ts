import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../../guards/roles.guard';
import { IS_PUBLIC_KEY } from '../../../decorators/public.decorator';
import { TallyExportController } from './tally.controller';
import { TallyExportService } from './tally.service';

it.each(['exportXml', 'getSummary'] as const)(
  'protects financial %s with administrator access',
  (action) => {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);
    const handler = TallyExportController.prototype[action];
    expect(
      reflector.getAllAndOverride(IS_PUBLIC_KEY, [
        handler,
        TallyExportController,
      ]),
    ).not.toBe(true);
    const context = (role?: string) =>
      ({
        getHandler: () => handler,
        getClass: () => TallyExportController,
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            user: role ? { role } : undefined,
          }),
        }),
      }) as unknown as ExecutionContext;
    for (const role of [undefined, 'VIEWER', 'MODIFIER'])
      expect(() => guard.canActivate(context(role))).toThrow();
    expect(guard.canActivate(context('ADMIN'))).toBe(true);
  },
);

it('refuses to invent purchase amounts from cotton weight', async () => {
  const prisma = {
    systemSettings: { findFirst: jest.fn(() => Promise.resolve(null)) },
  };
  await expect(
    new TallyExportService(prisma as any).generateTallyXml({
      voucherTypes: ['Purchase'],
    }),
  ).rejects.toThrow('approved supplier bill');
});
