import { createServer, type Server } from 'node:http';
import { ConnectorReadinessService } from './connector-readiness.service';
import { PrismaService } from '../../services/prisma.service';
import { TallyExportController } from './tally/tally.controller';
import { TallyExportService } from './tally/tally.service';
import { IntegrationsService } from './integrations.service';

describe('Connector workflows', () => {
  it('reports missing provider access without claiming registration', async () => {
    const prisma = {
      invoice: {
        findUnique: jest.fn(() =>
          Promise.resolve({
            invoiceNo: 'INV-1',
            status: 'UNPAID',
            items: [],
            sellerGSTIN: null,
          }),
        ),
      },
    };
    const service = new ConnectorReadinessService(
      prisma as unknown as PrismaService,
    );
    const result = await service.ewayReadiness(1);
    expect(result.readyToRegister).toBe(false);
    expect(
      result.checks.filter((check) => !check.passed).length,
    ).toBeGreaterThan(0);
    expect(service.status().tally.liveSync).toBe(false);
  });
  it('does not silently accept an unknown invoice', async () => {
    const service = new ConnectorReadinessService({
      invoice: { findUnique: () => Promise.resolve(null) },
    } as unknown as PrismaService);
    await expect(service.ewayReadiness(99)).rejects.toThrow(
      'Invoice not found',
    );
  });
  it('finds existing customers before committing the preview', async () => {
    const service = new IntegrationsService({
      customer: { findMany: () => Promise.resolve([{ name: 'Buyer' }]) },
    } as unknown as PrismaService);
    const result = await service.previewWithConflicts({
      entity: 'customers',
      headers: ['Name'],
      rows: [['buyer']],
      mapping: { name: 0 },
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 2, field: 'name' }),
      ]),
    );
  });
  it('uses the same voucher filter in preview and rejects unknown types', async () => {
    const generateTallyXml = jest.fn(() =>
      Promise.resolve({
        filename: 'test.xml',
        stats: {},
        xml: 'test',
      }),
    );
    const controller = new TallyExportController({
      generateTallyXml,
    } as unknown as TallyExportService);
    await controller.getSummary('2026-10-01', '2026-10-31', 'Receipt');
    expect(generateTallyXml).toHaveBeenCalledWith({
      from: '2026-10-01',
      to: '2026-10-31',
      voucherTypes: ['Receipt'],
    });
    await expect(
      controller.getSummary(undefined, undefined, 'Bogus'),
    ).rejects.toThrow('Choose Sales');
  });
  it('checks a loaded local Tally company without posting accounting data', async () => {
    let received = '';
    const previous = process.env.TALLY_PORT;
    const server: Server = createServer((req, res) => {
      req.on('data', (chunk) => {
        received += String(chunk);
      });
      req.on('end', () =>
        res.end('<ENVELOPE><COMPANY NAME="Example" /></ENVELOPE>'),
      );
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    process.env.TALLY_PORT = String(
      (server.address() as { port: number }).port,
    );
    try {
      const result = await new ConnectorReadinessService(
        {} as PrismaService,
      ).tallyConnection();
      expect(result.connected).toBe(true);
      expect(received).toContain('<TALLYREQUEST>Export</TALLYREQUEST>');
      expect(received).not.toContain('Import Data');
    } finally {
      if (previous === undefined) delete process.env.TALLY_PORT;
      else process.env.TALLY_PORT = previous;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
