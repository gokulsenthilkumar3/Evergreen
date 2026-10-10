import { ConflictException, BadRequestException } from '@nestjs/common';

/**
 * Manufacturing / Inventory — Settle Gap Configuration
 * Minimum settle gap between inward batch receipt and production start:
 * 0 hours + 1 minute + 1 second = 61,000 ms (00:01:01)
 */
export const SETTLE_GAP_MS = Number(process.env.EVERGREEN_SETTLE_GAP_MS || 61_000);

/**
 * Mass balance tolerance for production output vs raw material consumption
 * (e.g. 2% tolerance to account for allowable moisture / count variances)
 */
export const MASS_BALANCE_TOLERANCE = 0.02;

export interface TraceChain {
  inwardId?: number | string;
  batchNo?: string;
  productionId?: number | string;
  productionIds?: Array<number | string>;
  bagCodes?: string[];
  counts?: string[];
  wasteId?: number | string;
  wasteTypes?: string[];
  outwardId?: number | string;
  invoiceNo?: string;
  [key: string]: any;
}

export interface DeleteGuardErrorPayload {
  statusCode: number;
  code: string;
  message: string;
  trace?: TraceChain;
  redirectTo?: string;
  blockingProductionIds?: number[];
  blockingOutwardIds?: number[];
  inwardReceivedAt?: Date;
  earliestStartAt?: Date;
}

export class DeleteGuardConflictException extends ConflictException {
  constructor(payload: DeleteGuardErrorPayload) {
    super(payload);
  }
}

/**
 * Throws when attempting to delete an inward batch that is used by active productions
 */
export function throwInwardUnderProduction(opts: {
  inwardId: number;
  batchNo: string;
  productionIds: number[];
}): never {
  throw new DeleteGuardConflictException({
    statusCode: 409,
    code: 'INWARD_UNDER_PRODUCTION',
    message: `Inward batch "${opts.batchNo}" cannot be deleted — it has active production entries. Delete the corresponding production entry first.`,
    blockingProductionIds: opts.productionIds,
    trace: {
      inwardId: opts.inwardId,
      batchNo: opts.batchNo,
      productionIds: opts.productionIds,
    },
    redirectTo: `/production?batchNo=${encodeURIComponent(opts.batchNo)}`,
  });
}

/**
 * Throws when production start date/time is before the inward batch received time + settle gap
 */
export function throwProductionTooEarly(opts: {
  batchNo: string;
  inwardReceivedAt: Date;
  earliestStartAt: Date;
  startedAt: Date;
}): never {
  const inwardStr = opts.inwardReceivedAt.toLocaleString('en-IN');
  const earliestStr = opts.earliestStartAt.toLocaleString('en-IN');
  throw new DeleteGuardConflictException({
    statusCode: 409,
    code: 'PRODUCTION_TOO_EARLY',
    message: `Batch "${opts.batchNo}" was received at ${inwardStr}. Production can only start after ${earliestStr} (minimum settle gap of 00:01:01).`,
    inwardReceivedAt: opts.inwardReceivedAt,
    earliestStartAt: opts.earliestStartAt,
    trace: {
      batchNo: opts.batchNo,
      startedAt: opts.startedAt.toISOString(),
      inwardReceivedAt: opts.inwardReceivedAt.toISOString(),
      earliestStartAt: opts.earliestStartAt.toISOString(),
    },
    redirectTo: '/inward',
  });
}

/**
 * Throws when production start date/time is in the future
 */
export function throwProductionInFuture(startedAt: Date): never {
  throw new BadRequestException({
    statusCode: 400,
    code: 'PRODUCTION_IN_FUTURE',
    message: `Production date/time (${startedAt.toLocaleString('en-IN')}) cannot be in the future.`,
  });
}

/**
 * Throws when mass balance exceeded
 */
export function throwMassBalanceExceeded(opts: {
  totalConsumed: number;
  totalProduced: number;
  totalWaste: number;
  tolerance: number;
}): never {
  const allowedMax = (opts.totalConsumed * (1 + opts.tolerance)).toFixed(2);
  const totalOutput = (opts.totalProduced + opts.totalWaste).toFixed(2);
  throw new BadRequestException({
    statusCode: 400,
    code: 'MASS_BALANCE_EXCEEDED',
    message: `Mass balance mismatch: Total output (${totalOutput} kg) exceeds consumed raw material (${opts.totalConsumed} kg) beyond allowed ${(opts.tolerance * 100).toFixed(0)}% tolerance (max allowed: ${allowedMax} kg).`,
  });
}

/**
 * Throws when deleting a production run whose produced bags are already billed or outwarded
 */
export function throwProductionHasBilledBags(opts: {
  productionId: number;
  counts: string[];
  details?: string;
}): never {
  throw new DeleteGuardConflictException({
    statusCode: 409,
    code: 'PRODUCTION_HAS_BILLED_BAGS',
    message: `Cannot delete production entry #${opts.productionId} — yarn bags from this production run are already outwarded or billed.`,
    trace: {
      productionId: opts.productionId,
      counts: opts.counts,
    },
    redirectTo: '/outward',
  });
}

/**
 * Throws when deleting a production run whose waste has already been exported or sold
 */
export function throwProductionHasSoldWaste(opts: {
  productionId: number;
  wasteTypes?: string[];
}): never {
  throw new DeleteGuardConflictException({
    statusCode: 409,
    code: 'PRODUCTION_HAS_SOLD_WASTE',
    message: `Cannot delete production entry #${opts.productionId} — waste generated by this run has already been exported or sold.`,
    trace: {
      productionId: opts.productionId,
      wasteTypes: opts.wasteTypes,
    },
    redirectTo: '/inventory',
  });
}

/**
 * Throws when attempting to delete waste that was exported/sold or linked to production
 */
export function throwWasteSoldOrLinked(opts: {
  wasteId: number;
  productionId?: number | null;
  reference?: string;
  isSold?: boolean;
}): never {
  if (opts.isSold) {
    throw new DeleteGuardConflictException({
      statusCode: 409,
      code: 'WASTE_SOLD',
      message: `Waste entry #${opts.wasteId} cannot be deleted — it has already been exported/sold.`,
      trace: {
        wasteId: opts.wasteId,
        productionId: opts.productionId || undefined,
        reference: opts.reference,
      },
      redirectTo: opts.productionId ? `/production?id=${opts.productionId}` : '/inventory',
    });
  }

  throw new DeleteGuardConflictException({
    statusCode: 409,
    code: 'WASTE_PRODUCTION_LINKED',
    message: 'Cannot delete production waste directly. Please delete or modify the parent production entry.',
    trace: {
      wasteId: opts.wasteId,
      productionId: opts.productionId || undefined,
      reference: opts.reference,
    },
    redirectTo: opts.productionId ? `/production?id=${opts.productionId}` : '/production',
  });
}

/**
 * Throws when attempting to delete an outward entry that is already billed in an invoice
 */
export function throwOutwardBilled(opts: {
  outwardId: number;
  invoiceNo?: string;
}): never {
  throw new DeleteGuardConflictException({
    statusCode: 409,
    code: 'OUTWARD_BILLED',
    message: `Outward dispatch #${opts.outwardId} cannot be deleted — it is linked to an invoice or sales record.`,
    trace: {
      outwardId: opts.outwardId,
      invoiceNo: opts.invoiceNo,
    },
    redirectTo: '/business',
  });
}
