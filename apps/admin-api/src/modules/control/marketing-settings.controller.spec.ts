import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  DEFAULT_MARKETING_SETTINGS,
  MarketingSettingsDto,
  MarketingSettingsService,
} from './marketing-settings.controller';
import { PrismaService } from '../../services/prisma.service';

describe('public marketing contacts', () => {
  const body = { ...DEFAULT_MARKETING_SETTINGS, version: 0 };
  const create = () => {
    const tx = {
      controlRecord: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      controlAudit: { create: jest.fn() },
    };
    const db = {
      ...tx,
      $transaction: (fn: (value: typeof tx) => unknown) => fn(tx),
    };
    return {
      tx,
      service: new MarketingSettingsService(db as unknown as PrismaService),
    };
  };
  it('returns confirmed defaults and only the public whitelist', async () => {
    const { tx, service } = create();
    expect(await service.read()).toEqual(body);
    tx.controlRecord.findUnique.mockResolvedValue({
      version: 5,
      payload: JSON.stringify({
        ...body,
        privateKey: 'never-public',
        actor: 'private',
      }),
    });
    expect(await service.read()).toEqual({ ...body, version: 5 });
  });
  it('publishes with an audit entry and refuses stale edits', async () => {
    const { tx, service } = create();
    expect(await service.save(body, 'Owner')).toEqual({ ...body, version: 1 });
    expect(tx.controlAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'PUBLIC_CONTACTS_UPDATED',
          actor: 'Owner',
        }),
      }),
    );
    tx.controlRecord.findUnique.mockResolvedValue({ version: 2 });
    await expect(service.save(body, 'Owner')).rejects.toThrow(
      'Reload before saving',
    );
    tx.controlRecord.findUnique.mockResolvedValue({ version: 0 });
    tx.controlRecord.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.save(body, 'Owner')).rejects.toThrow(
      'Reload before saving',
    );
  });
  it('rejects invalid email, time, version and reversed hours', async () => {
    const { service } = create();
    for (const override of [
      { salesEmail: 'javascript:alert(1)' },
      { opensAt: '25:00' },
      { version: -1 },
    ])
      expect(
        (
          await validate(
            plainToInstance(MarketingSettingsDto, { ...body, ...override }),
          )
        ).length,
      ).toBeGreaterThan(0);
    await expect(
      service.save({ ...body, closesAt: '08:00' }, 'Owner'),
    ).rejects.toThrow('Closing time');
  });
});
