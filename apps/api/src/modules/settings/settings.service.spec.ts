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
    [{ businessMode: 'OTHER' }],
    [{ businessMode: null }],
    [{ workspaceMode: 'ADMIN' }],
    [{ workspaceMode: null }],
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

  it('saves processing-only guided setup with the authenticated actor', async () => {
    const result = await service.updateSettings(
      { businessMode: 'PROCESSING', workspaceMode: 'GUIDED' },
      'owner',
    );
    expect(result).toMatchObject({
      businessMode: 'PROCESSING',
      workspaceMode: 'GUIDED',
      updatedBy: 'owner',
    });
  });

  it('rejects a seller state that disagrees with the company GSTIN', async () => {
    await expect(
      service.updateSettings({
        gstin: '33ABCDE1234F1Z5',
        sellerState: 'Kerala',
      }),
    ).rejects.toThrow(/registered in Tamil Nadu, not Kerala/);
    prisma.systemSettings.findFirst.mockResolvedValue({
      id: 1,
      gstin: '32ABCDE1234F1Z5',
    });
    await expect(
      service.updateSettings({ sellerState: 'Tamil Nadu' }),
    ).rejects.toThrow(/registered in Kerala/);
    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
  });

  it('stores the canonical spelling of a matching seller state', async () => {
    await service.updateSettings({
      gstin: '33ABCDE1234F1Z5',
      sellerState: ' tamil nadu ',
    });
    expect(prisma.systemSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { gstin: '33ABCDE1234F1Z5', sellerState: 'Tamil Nadu' },
    });
    await expect(
      service.updateSettings({ sellerState: 'Atlantis' }),
    ).rejects.toThrow(BadRequestException);
  });
});
