import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { previewImport, type ImportInput } from '@evergreen/types';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  preview(input: ImportInput) {
    try {
      return previewImport(input);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid import',
      );
    }
  }

  async previewWithConflicts(input: ImportInput) {
    const preview = this.preview(input);
    if (input.entity === 'customers') {
      const existing = new Set(
        (await this.prisma.customer.findMany({ select: { name: true } })).map(
          (row) => row.name.trim().toLowerCase(),
        ),
      );
      preview.records.forEach((row, index) => {
        if (existing.has(String(row.name).toLowerCase()))
          preview.issues.push({
            row: index + 2,
            field: 'name',
            message:
              'Customer already exists. Existing records are never overwritten.',
          });
      });
    } else {
      const existing = new Set(
        (
          await this.prisma.catalogueItem.findMany({
            where: {
              sku: { in: preview.records.map((row) => String(row.sku)) },
            },
            select: { sku: true },
          })
        ).map((row) => row.sku),
      );
      preview.records.forEach((row, index) => {
        if (existing.has(String(row.sku)))
          preview.issues.push({
            row: index + 2,
            field: 'sku',
            message:
              'SKU already exists. Existing records are never overwritten.',
          });
      });
    }
    return preview;
  }

  async commit(
    input: ImportInput & { source: string; requestKey: string },
    actor: string,
  ) {
    const preview = this.preview(input);
    if (preview.issues.length)
      throw new BadRequestException({
        message: 'Resolve every preview error before importing.',
        issues: preview.issues,
      });
    if (
      typeof input.source !== 'string' ||
      !input.source.trim() ||
      input.source.length > 200 ||
      typeof input.requestKey !== 'string' ||
      !/^[a-zA-Z0-9-]{16,100}$/.test(input.requestKey)
    )
      throw new BadRequestException(
        'Supply a source name and a stable request key (16–100 letters, digits or hyphens).',
      );
    const source = input.source.trim();
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify({
          source,
          entity: input.entity,
          records: preview.records,
        }),
      )
      .digest('hex');
    const replay = async () => {
      const prior = await this.prisma.importBatch.findUnique({
        where: { requestKey: input.requestKey },
      });
      if (prior && prior.fingerprint !== fingerprint)
        throw new ConflictException(
          'This request key was already used for different data.',
        );
      return (
        prior ?? this.prisma.importBatch.findUnique({ where: { fingerprint } })
      );
    };
    const prior = await replay();
    if (prior) return { ...prior, replayed: true };
    try {
      const batch = await this.prisma.$transaction(
        async (tx) => {
          const ids: number[] = [];
          const customerNames =
            input.entity === 'customers'
              ? new Set(
                  (await tx.customer.findMany({ select: { name: true } })).map(
                    (customer) => customer.name.trim().toLowerCase(),
                  ),
                )
              : new Set<string>();
          for (const record of preview.records) {
            if (input.entity === 'items') {
              if (
                await tx.catalogueItem.findUnique({
                  where: { sku: String(record.sku) },
                })
              )
                throw new ConflictException(
                  `SKU ${record.sku} already exists. No records were imported.`,
                );
              const item = await tx.catalogueItem.create({
                data: {
                  sku: String(record.sku),
                  name: String(record.name),
                  type: String(record.type),
                  uom: String(record.uom),
                  hsnSac: record.hsnSac ? String(record.hsnSac) : null,
                  gstRate: Number(record.gstRate),
                  salePrice: Number(record.salePrice),
                  legacySource: source,
                },
              });
              ids.push(item.id);
            } else {
              // Conservative identity matching: ambiguous same-name parties require manual reconciliation.
              if (customerNames.has(String(record.name).toLowerCase()))
                throw new ConflictException(
                  `Customer ${record.name} already exists. No records were imported.`,
                );
              const customer = await tx.customer.create({
                data: {
                  name: String(record.name),
                  phone: record.phone ? String(record.phone) : null,
                  email: record.email ? String(record.email) : null,
                  gstin: record.gstin ? String(record.gstin) : null,
                  address: record.address ? String(record.address) : null,
                  state: record.state ? String(record.state) : null,
                },
              });
              ids.push(customer.id);
              customerNames.add(String(record.name).toLowerCase());
            }
          }
          const result = await tx.importBatch.create({
            data: {
              requestKey: input.requestKey,
              fingerprint,
              source,
              entity: input.entity,
              rowCount: ids.length,
              recordIds: JSON.stringify(ids),
              createdBy: actor,
            },
          });
          await tx.activityLog.create({
            data: {
              action: 'IMPORT',
              module: 'INTEGRATIONS',
              username: actor,
              details: `Imported ${ids.length} ${input.entity}; batch ${result.id}; source ${source}`,
            },
          });
          return result;
        },
        { timeout: 30000 },
      );
      return { ...batch, replayed: false };
    } catch (error) {
      // A concurrent identical request may have committed first; never report it as a new import.
      const completed = await replay();
      if (completed) return { ...completed, replayed: true };
      throw error;
    }
  }

  history() {
    return this.prisma.importBatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
