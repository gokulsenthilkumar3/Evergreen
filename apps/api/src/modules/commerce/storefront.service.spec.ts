import { BadRequestException } from '@nestjs/common';
import { StorefrontService } from './storefront.service';

describe('Public storefront safeguards', () => {
  const prisma = {
    catalogueItem: { findMany: jest.fn() },
    stockMovement: { aggregate: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new StorefrontService(prisma as any);

  beforeEach(() => jest.clearAllMocks());

  it('queries only active, published, saleable products and returns safe fields', async () => {
    prisma.catalogueItem.findMany.mockResolvedValue([{ id: 7, sku: 'Y-7', name: 'Cotton yarn', description: 'Fine yarn', type: 'YARN', uom: 'KG', gstRate: 5, salePrice: 100, imageUrl: 'https://elsewhere.example/pixel', brand: { active: true, name: 'Weave' }, category: null }]);
    prisma.stockMovement.aggregate.mockResolvedValue({ _sum: { quantity: 10, reservedQty: 2 } });

    expect(await service.products()).toEqual([{ id: 7, sku: 'Y-7', name: 'Cotton yarn', description: 'Fine yarn', type: 'YARN', uom: 'KG', gstRate: 5, salePrice: 100, imageUrl: null, brand: 'Weave', category: null, available: 8 }]);
    expect(prisma.catalogueItem.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { active: true, shopVisible: true, type: { in: ['YARN', 'FINISHED_GOOD', 'SERVICE'] } } }));
  });

  it('rejects invalid checkout before starting a transaction', async () => {
    await expect(service.placeOrder({ name: 'Buyer', phone: '123', address: 'A valid address', state: 'Tamil Nadu', lines: [{ itemId: 1, quantity: 1 }] })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.placeOrder({ name: 'Buyer', phone: '9876543210', address: 'A valid address', state: 'Tamil Nadu', lines: [{ itemId: 1, quantity: 1 }, { itemId: 1, quantity: 1 }] })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
