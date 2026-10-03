jest.mock('../../prisma/client', () => ({
  prisma: {
    invoice: { findMany: jest.fn().mockResolvedValue([]), aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: null } }) },
    productionBatch: { count: jest.fn().mockResolvedValue(0) },
    productionStage: { groupBy: jest.fn().mockResolvedValue([]) },
  },
}));

import { getComplianceReport, getDashboardKPIs } from './reporting.service';

describe('empty reporting states', () => {
  it('does not invent profit, growth, efficiency, or chart costs without source data', async () => {
    const dashboard = await getDashboardKPIs();
    expect(dashboard.financial).toEqual({ revenue: 0, profit: null, growth: null });
    expect(dashboard.operations).toEqual({ activeBatches: 0, activeOperators: 0, efficiency: null });
    expect(dashboard.charts.operationalEfficiency).toEqual([]);
    expect(dashboard.charts.revenueVsCost).toEqual([]);
  });

  it('reports cost and profit as unavailable when no ledgers are connected', async () => {
    const result = await getComplianceReport('financials', { startDate: '2026-01-01', endDate: '2026-12-31' });
    expect(result).toMatchObject({ revenue: 0, cogs: null, grossProfit: null, expenses: null, netProfit: null });
  });
});
