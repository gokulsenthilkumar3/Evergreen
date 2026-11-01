import { recordedProof, jobProof } from './proof';
import { ControlService } from './control.service';
describe('server-owned proof', () => {
  const updatedAt = new Date('2026-11-01T00:00:00Z');
  it('does not promote saved claims or successful jobs to independent verification', () => {
    expect(recordedProof(updatedAt).state).toBe('recorded');
    expect(
      jobProof({ status: 'SUCCEEDED', runId: '123', updatedAt }).state,
    ).toBe('executed');
    expect(jobProof({ status: 'SUCCEEDED', updatedAt }).state).toBe(
      'requested',
    );
    expect(jobProof({ status: 'FAILED', updatedAt }).state).toBe('failed');
  });
  it('rejects arbitrary table names and negative pages before database access', async () => {
    const service = new ControlService({} as never);
    await expect(
      service.explore({ table: 'ProviderAdmin' }, 'Owner'),
    ).rejects.toThrow('allowed provider table');
    await expect(
      service.explore({ table: 'Company', page: -1 }, 'Owner'),
    ).rejects.toThrow('Invalid page');
  });
  it('ignores caller-written proof claims on saved records', async () => {
    const prisma = {
      controlRecord: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            {
              id: 'one',
              kind: 'PAYMENT',
              status: 'VERIFIED',
              payload: JSON.stringify({
                proof: 'verified',
                evidenceUrl: 'https://example.com',
              }),
              updatedAt,
            },
          ]),
      },
    };
    const rows = await new ControlService(prisma as never).list();
    expect(rows[0].proof.state).toBe('recorded');
  });
  it('projects out credentials and writes an audit event for data browsing', async () => {
    const prisma = {
      company: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      controlAudit: { create: jest.fn().mockResolvedValue({}) },
    };
    await new ControlService(prisma as never).explore(
      { table: 'Company' },
      'Owner',
    );
    const select = prisma.company.findMany.mock.calls[0][0].select;
    expect(select.apiKey).toBeUndefined();
    expect(select.licenseKey).toBeUndefined();
    expect(prisma.controlAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actor: 'Owner',
          action: 'DATA_EXPLORER_READ',
        }),
      }),
    );
  });
});
