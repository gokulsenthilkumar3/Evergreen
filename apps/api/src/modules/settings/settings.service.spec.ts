import { BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  const prisma = {
    systemSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new SettingsService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.systemSettings.findFirst.mockResolvedValue({ id: 1 });
    prisma.systemSettings.update.mockImplementation(({ data }) => ({
      id: 1,
      ...data,
    }));
  });

  it('persists a supported locale and canonical count subset', async () => {
    await service.updateSettings({
      language: 'ta',
      supportedCounts: '2, 4,10',
      packageRate: 1.6,
    });
    expect(prisma.systemSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { language: 'ta', supportedCounts: '2,4,10', packageRate: '1.6' },
    });
  });

  it.each([
    [{ language: 'fr' }],
    [{ supportedCounts: '2,20' }],
    [{ supportedCounts: '2,2' }],
    [{ packageRate: -1 }],
    [{ id: 99 }],
  ])('rejects unsafe or invalid settings payload %p', async (payload) => {
    await expect(service.updateSettings(payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
  });
});
