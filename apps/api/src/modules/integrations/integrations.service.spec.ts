/**
 * IntegrationsService — unit tests
 *
 * Coverage targets:
 *  - preview(): valid input, invalid input, empty rows
 *  - commit(): success path, replay (same key+data), changed-data conflict,
 *              duplicate fingerprint protection, SKU/customer conflicts,
 *              missing/invalid requestKey format
 *  - history(): delegation to prisma
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { previewImport } from '@evergreen/types';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../services/prisma.service';

/** Compute the fingerprint that IntegrationsService.commit() would compute for a given input */
function computeFingerprint(
  source: string,
  entity: string,
  input: any,
): string {
  const preview = previewImport(input);
  return createHash('sha256')
    .update(JSON.stringify({ source, entity, records: preview.records }))
    .digest('hex');
}

// ---------------------------------------------------------------------------
// Minimal PrismaService stub
// ---------------------------------------------------------------------------
const makePrismaStub = (overrides: Partial<typeof prismaStub> = {}) => ({
  importBatch: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
  },
  customer: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
  },
  catalogueItem: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
  activityLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  ...overrides,
});

let prismaStub: ReturnType<typeof makePrismaStub>;

// ---------------------------------------------------------------------------
// Valid import payloads
// ---------------------------------------------------------------------------
const validCustomerInput = {
  entity: 'customers' as const,
  headers: ['Party Name', 'Phone'],
  rows: [['Ramesh Textiles', '9876543210']],
  mapping: { name: 0, phone: 1 },
  source: 'old-register',
  requestKey: 'abcdef12-3456-7890-abcd-ef1234567890',
};

const validItemInput = {
  entity: 'items' as const,
  headers: ['SKU', 'Name', 'Type', 'UOM'],
  rows: [['YARN-2S', 'Yarn 2s', 'YARN', 'KG']],
  mapping: { sku: 0, name: 1, type: 2, uom: 3 },
  source: 'old-catalogue',
  requestKey: 'aaaabbbb-cccc-dddd-eeee-ffff00001111',
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('IntegrationsService', () => {
  let service: IntegrationsService;

  beforeEach(async () => {
    prismaStub = makePrismaStub();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: PrismaService, useValue: prismaStub },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
  });

  // ── preview ──────────────────────────────────────────────────────────────

  describe('preview()', () => {
    it('returns records and no issues for a valid customer input', () => {
      const result = service.preview(validCustomerInput);
      expect(result.records).toHaveLength(1);
      expect(result.issues).toHaveLength(0);
      expect(result.records[0]).toHaveProperty('name', 'Ramesh Textiles');
    });

    it('returns records and no issues for a valid item input', () => {
      const result = service.preview(validItemInput);
      expect(result.records).toHaveLength(1);
      expect(result.issues).toHaveLength(0);
      expect(result.records[0]).toHaveProperty('sku', 'YARN-2S');
    });

    it('throws BadRequestException for empty rows', () => {
      expect(() =>
        service.preview({ ...validCustomerInput, rows: [] }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when required field is missing from mapping', () => {
      // name is required for customers; remove it from mapping
      expect(() =>
        service.preview({ ...validCustomerInput, mapping: { phone: 1 } }),
      ).toThrow(BadRequestException);
    });

    it('returns preview issues (not throws) for invalid rows', () => {
      // name column mapped but value is blank
      const input = {
        ...validCustomerInput,
        rows: [['', '9876543210']],
      };
      const result = service.preview(input);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].field).toBe('name');
    });
  });

  // ── commit ────────────────────────────────────────────────────────────────

  describe('commit()', () => {
    beforeEach(() => {
      // Default: no prior batch, transaction commits successfully
      prismaStub.importBatch.create = jest.fn().mockResolvedValue({
        id: 1,
        requestKey: validCustomerInput.requestKey,
        fingerprint: 'fp-hash',
        source: validCustomerInput.source,
        entity: 'customers',
        rowCount: 1,
        recordIds: '[1]',
        createdBy: 'admin',
        createdAt: new Date(),
      });
      prismaStub.customer.create = jest.fn().mockResolvedValue({ id: 1 });
      prismaStub.activityLog.create = jest.fn().mockResolvedValue({});

      prismaStub.$transaction = jest
        .fn()
        .mockImplementation(async (fn: any) => {
          return await fn({
            customer: prismaStub.customer,
            catalogueItem: prismaStub.catalogueItem,
            importBatch: prismaStub.importBatch,
            activityLog: prismaStub.activityLog,
          });
        });
    });

    it('creates a new import batch and returns it with replayed: false', async () => {
      const result = await service.commit(validCustomerInput, 'admin');
      expect(result.replayed).toBe(false);
      expect(result.rowCount).toBe(1);
    });

    it('replays an identical request without creating a duplicate', async () => {
      // Compute the exact fingerprint that the service would compute for this input
      const realFingerprint = computeFingerprint(
        validCustomerInput.source,
        validCustomerInput.entity,
        validCustomerInput,
      );
      const existingBatch = {
        id: 1,
        requestKey: validCustomerInput.requestKey,
        fingerprint: realFingerprint, // must match what the service computes
        source: 'old-register',
        entity: 'customers',
        rowCount: 1,
        recordIds: '[1]',
        createdBy: 'admin',
        createdAt: new Date(),
      };
      // First findUnique returns the prior batch with matching fingerprint
      prismaStub.importBatch.findUnique = jest
        .fn()
        .mockResolvedValue(existingBatch);

      const result = await service.commit(validCustomerInput, 'admin');
      expect(result.replayed).toBe(true);
      expect(prismaStub.$transaction).not.toHaveBeenCalled();
    });

    it('throws ConflictException when requestKey is reused with different data', async () => {
      const existingBatch = {
        id: 1,
        requestKey: validCustomerInput.requestKey,
        fingerprint: 'different-fingerprint', // different from what would be computed
        source: 'old-register',
        entity: 'customers',
        rowCount: 1,
        recordIds: '[1]',
        createdBy: 'admin',
        createdAt: new Date(),
      };
      prismaStub.importBatch.findUnique = jest
        .fn()
        .mockResolvedValue(existingBatch);

      await expect(
        service.commit(
          { ...validCustomerInput, rows: [['Different Name', '1234567890']] },
          'admin',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException for missing source', async () => {
      await expect(
        service.commit({ ...validCustomerInput, source: '' }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid requestKey format (too short)', async () => {
      await expect(
        service.commit({ ...validCustomerInput, requestKey: 'short' }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for requestKey with special characters', async () => {
      await expect(
        service.commit(
          { ...validCustomerInput, requestKey: 'invalid key with spaces!!' },
          'admin',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when preview has issues', async () => {
      // Empty name — will produce preview issues
      await expect(
        service.commit(
          { ...validCustomerInput, rows: [['', '9876543210']] },
          'admin',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates customer import correctly', async () => {
      await service.commit(validCustomerInput, 'admin');
      expect(prismaStub.$transaction).toHaveBeenCalledTimes(1);
    });

    it('creates item import correctly', async () => {
      prismaStub.catalogueItem.create = jest.fn().mockResolvedValue({ id: 1 });
      prismaStub.importBatch.create = jest.fn().mockResolvedValue({
        id: 2,
        requestKey: validItemInput.requestKey,
        fingerprint: 'item-fp',
        source: validItemInput.source,
        entity: 'items',
        rowCount: 1,
        recordIds: '[1]',
        createdBy: 'admin',
        createdAt: new Date(),
      });

      const result = await service.commit(validItemInput, 'admin');
      expect(result.entity).toBe('items');
      expect(result.replayed).toBe(false);
    });

    it('throws ConflictException when SKU already exists', async () => {
      prismaStub.$transaction = jest
        .fn()
        .mockImplementation(async (fn: any) => {
          return await fn({
            customer: prismaStub.customer,
            catalogueItem: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ id: 99, sku: 'YARN-2S' }),
              create: jest.fn(),
            },
            importBatch: prismaStub.importBatch,
            activityLog: prismaStub.activityLog,
          });
        });

      await expect(service.commit(validItemInput, 'admin')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws ConflictException when customer name already exists (case-insensitive)', async () => {
      prismaStub.$transaction = jest
        .fn()
        .mockImplementation(async (fn: any) => {
          return await fn({
            customer: {
              findMany: jest
                .fn()
                .mockResolvedValue([{ name: 'ramesh textiles' }]),
              create: jest.fn(),
            },
            catalogueItem: prismaStub.catalogueItem,
            importBatch: prismaStub.importBatch,
            activityLog: prismaStub.activityLog,
          });
        });

      await expect(service.commit(validCustomerInput, 'admin')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ── history ───────────────────────────────────────────────────────────────

  describe('history()', () => {
    it('delegates to prisma.importBatch.findMany with correct options', async () => {
      const mockBatches = [
        {
          id: 1,
          source: 'test',
          entity: 'customers',
          rowCount: 5,
          createdAt: new Date(),
        },
      ];
      prismaStub.importBatch.findMany = jest
        .fn()
        .mockResolvedValue(mockBatches);

      const result = await service.history();
      expect(result).toEqual(mockBatches);
      expect(prismaStub.importBatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' }, take: 50 }),
      );
    });

    it('returns empty array when no import history exists', async () => {
      prismaStub.importBatch.findMany = jest.fn().mockResolvedValue([]);
      const result = await service.history();
      expect(result).toEqual([]);
    });
  });
});
