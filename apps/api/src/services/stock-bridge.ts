import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** Inventory owns cotton batches and produced yarn; commerce owns reservations and sales.
 * Corrections are appended to the catalogue ledger, preserving imported history.
 * Commerce yarn movements are projected back into inventory without importing them twice.
 */
export async function reconcileStock(tx: Prisma.TransactionClient) {
  const cotton = await tx.cottonInventory.findMany();
  const yarn = await tx.yarnInventory.findMany({ where: { type: { not: 'COMMERCE' } } });
  for (const [kind, entries] of [['COTTON', cotton], ['YARN', yarn]] as const) {
    const referenceType = `LEGACY_${kind}`;
    const imported = await tx.stockMovement.findMany({ where: { referenceType } });
    const groups = new Map<string, typeof imported>();
    for (const movement of imported) {
      const key = movement.referenceId || '';
      groups.set(key, [...(groups.get(key) || []), movement]);
    }
    const liveIds = new Set<string>();
    for (const entry of entries) {
      const id = String(entry.id);
      liveIds.add(id);
      const key = kind === 'COTTON'
        ? ('batchId' in entry && entry.batchId) || entry.reference || entry.type
        : ('count' in entry && entry.count) || entry.type;
      const sku = `LEGACY-${kind}-${key}`;
      const batch = kind === 'COTTON' ? await tx.inwardBatch.findUnique({ where: { batchId: key } }) : null;
      const mapped = batch?.catalogueItemId ? await tx.catalogueItem.findUnique({ where: { id: batch.catalogueItemId } }) : null;
      const item = mapped || await tx.catalogueItem.upsert({ where: { sku },
        create: { sku, name: kind === 'COTTON' ? `Cotton batch ${key}` : `Yarn ${key}`,
          type: kind === 'COTTON' ? 'RAW_MATERIAL' : 'YARN', uom: 'KG',
          legacySource: 'EVERGREEN_LEGACY', legacyId: key },
        update: { legacyId: key },
      });
      if (mapped && (mapped.type !== 'RAW_MATERIAL' || mapped.uom !== 'KG')) throw new BadRequestException('Cotton procurement must use a raw-material item in kilograms');
      if (mapped && mapped.legacySource !== 'EVERGREEN_LEGACY') await tx.catalogueItem.update({ where: { id: mapped.id }, data: { legacySource: 'EVERGREEN_LEGACY' } });
      const cottonLot = batch?.catalogueItemId ? await tx.stockLot.findUnique({ where: { code: `COTTON-${key}` } }) : null;
      const previous = groups.get(id) || [];
      const byItem = new Map<number, number>();
      for (const row of previous) byItem.set(row.itemId, (byItem.get(row.itemId) || 0) + row.quantity);
      byItem.set(item.id, byItem.get(item.id) || 0);
      for (const [itemId, recorded] of byItem) {
        const difference = (itemId === item.id ? entry.quantity : 0) - recorded;
        if (Math.abs(difference) < 0.000001) continue;
        await tx.stockMovement.create({ data: { itemId, date: entry.date, quantity: difference,
          lotId: cottonLot?.id || null, unitCost: entry.quantity > 0 ? batch?.unitCost ?? null : null,
          movementType: previous.length ? 'RECONCILIATION' : entry.type,
          referenceType, referenceId: id, legacySource: `EVERGREEN_${kind}`,
          notes: previous.length ? 'Inventory source changed; catalogue corrected' : entry.reference,
        } });
      }
    }
    for (const [id, rows] of groups) {
      if (liveIds.has(id)) continue;
      const byItem = new Map<number, number>();
      for (const row of rows) byItem.set(row.itemId, (byItem.get(row.itemId) || 0) + row.quantity);
      for (const [itemId, recorded] of byItem) {
        if (Math.abs(recorded) < 0.000001) continue;
        await tx.stockMovement.create({ data: { itemId, date: rows[0].date, quantity: -recorded,
          movementType: 'RECONCILIATION', referenceType, referenceId: id,
          legacySource: `EVERGREEN_${kind}`, notes: 'Inventory source removed; imported balance reversed',
        } });
      }
    }
  }

  const managed = await tx.catalogueItem.findMany({ where: { legacySource: 'EVERGREEN_LEGACY' } });
  for (const item of managed) {
    const movements = await tx.stockMovement.findMany({ where: { itemId: item.id,
      OR: [{ referenceType: null }, { referenceType: { notIn: ['LEGACY_COTTON', 'LEGACY_YARN'] } }],
    } });
    for (const movement of movements) {
      if (item.type === 'RAW_MATERIAL' && (movement.quantity || movement.reservedQty)) {
        throw new BadRequestException('Cotton batches are managed in Inward and Production. Use those screens to change cotton stock.');
      }
      if (item.type !== 'YARN' || !movement.quantity) continue;
      const count = item.legacyId || item.sku.replace(/^LEGACY-YARN-/, '');
      const reference = `COMMERCE-${movement.id}`;
      const existing = await tx.yarnInventory.findFirst({ where: { type: 'COMMERCE', reference } });
      if (existing && Math.abs(existing.quantity - movement.quantity) > 0.000001)
        await tx.yarnInventory.update({ where: { id: existing.id }, data: { quantity: movement.quantity } });
      if (!existing) await tx.yarnInventory.create({ data: {
        date: movement.date, type: 'COMMERCE', quantity: movement.quantity, balance: 0,
        reference, count, createdBy: movement.createdBy,
      } });
    }
  }
  const yarnRows = await tx.yarnInventory.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] });
  const balances = new Map<string | null, number>();
  for (const row of yarnRows) {
    const balance = (balances.get(row.count) || 0) + row.quantity;
    balances.set(row.count, balance);
    if (Math.abs(row.balance - balance) > 0.000001)
      await tx.yarnInventory.update({ where: { id: row.id }, data: { balance } });
  }
  const cottonRows = await tx.cottonInventory.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] });
  let cottonBalance = 0;
  for (const row of cottonRows) { cottonBalance += row.quantity; if (Math.abs(row.balance - cottonBalance) > 0.000001) await tx.cottonInventory.update({ where: { id: row.id }, data: { balance: cottonBalance } }); }
}

export async function guardManagedStock(tx: Prisma.TransactionClient, affectedItems?: Set<number>, checkWaste = true) {
  const waste = checkWaste ? await tx.wasteInventory.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] }) : [];
  let wasteBalance = 0;
  for (const row of waste) {
    wasteBalance += row.quantity;
    if (wasteBalance < -0.01) throw new BadRequestException('Waste cannot be recycled or sold before it is produced, or beyond the available weight.');
  }
  const items = await tx.catalogueItem.findMany({ where: { type: { not: 'SERVICE' }, ...(affectedItems ? { id: { in: [...affectedItems] } } : {}) } });
  for (const item of items) {
    const stock = await tx.stockMovement.aggregate({ where: { itemId: item.id }, _sum: { quantity: true, reservedQty: true } });
    if ((stock._sum.quantity || 0) - (stock._sum.reservedQty || 0) < -0.01)
      throw new BadRequestException(`Insufficient unreserved stock for ${item.name}. Release its orders or reduce the quantity.`);
    if ((stock._sum.reservedQty || 0) < -0.01) throw new BadRequestException(`Reservations for ${item.name} cannot be released twice.`);
    const locations = await tx.warehouseMovement.findMany({ where: { itemId: item.id } });
    const allocated = locations.reduce((sum, row) => sum + (row.movementType === 'IN' ? row.quantity : row.movementType === 'OUT' ? -row.quantity : 0), 0);
    if (allocated > (stock._sum.quantity || 0) + 0.01) throw new BadRequestException(`Release ${item.name} from its warehouse location before consuming or dispatching it.`);
    const movements = await tx.stockMovement.findMany({ where: { itemId: item.id }, orderBy: [{ date: 'asc' }, { id: 'asc' }] });
    // Sum equal timestamps before checking: a reversal may be appended after the original entry.
    const dates = new Map<number, number>();
    for (const row of movements) dates.set(row.date.getTime(), (dates.get(row.date.getTime()) || 0) + row.quantity);
    let balance = 0;
    for (const [date, quantity] of dates) {
      balance += quantity;
      if (balance < -0.01) throw new BadRequestException(`${item.name} would have negative stock on ${new Date(date).toLocaleDateString('en-IN')}. Check transaction dates and dependent sales.`);
    }
  }
}
