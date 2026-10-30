import { BadRequestException } from '@nestjs/common';
import { ProductionService } from './production.service';
import { PrismaService } from '../../services/prisma.service';

describe('ProductionService.findAll date range', () => {
  type Query = { where: { date?: { gte?: Date; lte?: Date } } };
  const findMany = jest.fn((query: Query) => {
    void query;
    return Promise.resolve([]);
  });
  const service = new ProductionService({
    production: { findMany },
  } as unknown as PrismaService);

  beforeEach(() => findMany.mockClear());

  it('returns every run when no range is given', async () => {
    await service.findAll();
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { createdBy: { not: 'SYSTEM_MERGE' } },
      }),
    );
  });

  it('covers whole local days from the start of `from` to the end of `to`', async () => {
    await service.findAll('2026-10-01', '2026-10-30');
    const where = findMany.mock.calls[0][0].where;
    expect(where.date?.gte).toEqual(new Date(2026, 9, 1, 0, 0, 0, 0));
    expect(where.date?.lte).toEqual(new Date(2026, 9, 30, 23, 59, 59, 999));
  });

  it('accepts an open-ended range', async () => {
    await service.findAll('2026-10-01');
    const where = findMany.mock.calls[0][0].where;
    expect(where.date).toEqual({ gte: new Date(2026, 9, 1) });
  });

  it.each([
    ['2026-02-30', undefined],
    ['yesterday', undefined],
    ['2026-10-30', '2026-10-01'],
  ])('rejects %s..%s', async (from, to) => {
    await expect(service.findAll(from, to)).rejects.toThrow(
      BadRequestException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });
});
