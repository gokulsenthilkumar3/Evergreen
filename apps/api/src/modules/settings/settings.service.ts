import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

const EDITABLE_SETTINGS = new Set([
  'companyName',
  'address',
  'gstin',
  'phone',
  'email',
  'logo',
  'autoBackup',
  'emailNotifications',
  'lowStockAlert',
  'defaultInvoiceTheme',
  'lowStockThreshold',
  'maintenanceRate',
  'ebRate',
  'packageRate',
  'gstPercent',
  'language',
  'sellerState',
  'supportedCounts',
  'updatedBy',
]);
const CANONICAL_COUNTS = new Set(['2', '4', '6', '8', '10']);

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.systemSettings.findFirst();
    if (!settings) {
      console.log('⚙️ Initializing default system settings...');
      return this.prisma.systemSettings.create({
        data: {}, // Uses defaults defined in schema
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Settings payload must be an object');
    }
    const unknown = Object.keys(data).filter(
      (key) => !EDITABLE_SETTINGS.has(key),
    );
    if (unknown.length) {
      throw new BadRequestException(
        `Unsupported settings: ${unknown.join(', ')}`,
      );
    }
    const updateData = { ...data };
    if (updateData.language && !['en', 'ta'].includes(updateData.language)) {
      throw new BadRequestException('Language must be en or ta');
    }
    if (updateData.supportedCounts !== undefined) {
      const counts = String(updateData.supportedCounts)
        .split(',')
        .map((count) => count.trim())
        .filter(Boolean);
      if (
        !counts.length ||
        new Set(counts).size !== counts.length ||
        counts.some((count) => !CANONICAL_COUNTS.has(count))
      ) {
        throw new BadRequestException(
          'Supported counts must be a unique subset of 2,4,6,8,10',
        );
      }
      updateData.supportedCounts = counts.join(',');
    }
    for (const field of [
      'maintenanceRate',
      'ebRate',
      'packageRate',
      'gstPercent',
      'lowStockThreshold',
    ]) {
      if (
        updateData[field] !== undefined &&
        (!Number.isFinite(Number(updateData[field])) ||
          Number(updateData[field]) < 0)
      ) {
        throw new BadRequestException(`${field} must be a non-negative number`);
      }
      if (updateData[field] !== undefined)
        updateData[field] = String(Number(updateData[field]));
    }

    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data: updateData,
    });
  }
}
