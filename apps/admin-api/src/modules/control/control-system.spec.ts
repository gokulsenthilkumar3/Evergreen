import { ControlService } from './control.service';
describe('storage/API console', () => {
 it('reports the active connection and derives counts from persisted models', async () => {
  const prisma = {
   $queryRawUnsafe: jest.fn().mockResolvedValue([{ name: 'main', file: '/private/provider.db' }]),
   company: { count: jest.fn().mockResolvedValue(3) },
   controlRecord: { groupBy: jest.fn().mockResolvedValue([{ kind: 'CHAT', _count: { _all: 2 } }, { kind: 'TASK', _count: { _all: 4 } }]) },
   releaseJob: { count: jest.fn().mockResolvedValue(1) }, controlAudit: { count: jest.fn().mockResolvedValue(7) },
  };
  const result = await new ControlService(prisma as never).system();
  expect(result.database.location).toBe('/private/provider.db');
  expect(result.database.cloudManaged).toBe(false);
  expect(result.tables.find(t => t.name === 'ControlRecord')?.count).toBe(6);
  expect(result.modules.find(m => m.name === 'Spinning mills')?.count).toBe(3);
  expect(result.modules.find(m => m.name === 'CHAT')?.count).toBe(2);
  expect(result.modules.find(m => m.name === 'Customer API monitoring')?.count).toBeNull();
 });
});
