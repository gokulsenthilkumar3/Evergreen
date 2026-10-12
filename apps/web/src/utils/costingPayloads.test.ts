import { describe, expect, it } from 'vitest';
import { ebCostPayload, employeeCostPayload, expensePayload, maintenanceCostPayload, packagingCostPayload } from './costingPayloads';

// These shapes must match the API's costing DTOs exactly: the server rejects unknown fields.
describe('costing request bodies', () => {
  const date = '2026-10-12';

  it('sends electricity inputs as numbers and no total', () => {
    expect(ebCostPayload(date, { unitsConsumed: '120.5', ratePerUnit: '8', noOfShifts: '2' })).toEqual({ date, unitsConsumed: 120.5, ratePerUnit: 8, noOfShifts: 2 });
  });

  it('defaults a blank shift count to one', () => {
    expect(ebCostPayload(date, { unitsConsumed: '10', ratePerUnit: '8', noOfShifts: '' }).noOfShifts).toBe(1);
    expect(employeeCostPayload(date, { workers: '4', workerRate: '600', noOfShifts: undefined, overtime: '' })).toEqual({ date, workers: 4, rate: 600, noOfShifts: 1, overtime: 0 });
  });

  it('maps the form worker rate to the API rate field', () => {
    const body = employeeCostPayload(date, { workers: '12', workerRate: '550.50', noOfShifts: '3', overtime: '900' });
    expect(body).toEqual({ date, workers: 12, rate: 550.5, noOfShifts: 3, overtime: 900 });
    expect(body).not.toHaveProperty('workerRate');
  });

  it('sends packaging quantity and rate only', () => {
    expect(packagingCostPayload(date, 1250.75, '1.6')).toEqual({ date, yarnProduced: 1250.75, ratePerKg: 1.6 });
  });

  it('keeps the entered maintenance amount and omits a blank rate', () => {
    expect(maintenanceCostPayload(date, { description: '', totalCost: '5000', ratePerKg: '4' })).toEqual({ date, description: 'Daily Maintenance', totalCost: 5000, ratePerKg: 4 });
    expect(maintenanceCostPayload(date, { description: 'Belt change', totalCost: '750', ratePerKg: '' })).toEqual({ date, description: 'Belt change', totalCost: 750 });
  });

  it('trims the expense title and omits an empty description', () => {
    expect(expensePayload(date, { title: '  Laptop ', amount: '45000', description: '', type: 'Asset' })).toEqual({ date, title: 'Laptop', amount: 45000, type: 'Asset' });
  });

  it('never sends an author, a category or a computed total', () => {
    const bodies = [
      ebCostPayload(date, { unitsConsumed: '1', ratePerUnit: '1', noOfShifts: '1' }),
      employeeCostPayload(date, { workers: '1', workerRate: '1', noOfShifts: '1', overtime: '0' }),
      packagingCostPayload(date, 1, '1'),
      expensePayload(date, { title: 'x', amount: '1', description: 'y', type: 'General' }),
    ];
    for (const body of bodies) for (const key of ['createdBy', 'category', 'totalCost']) expect(body).not.toHaveProperty(key);
  });

  it('passes unparseable input through as NaN so the caller and server reject it', () => {
    expect(Number.isNaN(ebCostPayload(date, { unitsConsumed: 'abc', ratePerUnit: '8', noOfShifts: '1' }).unitsConsumed)).toBe(true);
  });
});
