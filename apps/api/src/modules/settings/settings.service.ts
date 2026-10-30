import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import {
  BUSINESS_MODES,
  WORKSPACE_MODES,
  canonicalIndianState,
  gstinStateName,
} from '@evergreen/types';

const EDITABLE_SETTINGS = new Set([
  'businessMode',
  'workspaceMode',
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

  async updateSettings(data: any, actor?: string) {
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
    if (
      data.businessMode !== undefined &&
      !BUSINESS_MODES.includes(data.businessMode)
    ) {
      throw new BadRequestException('Choose a supported business mode');
    }
    if (
      data.workspaceMode !== undefined &&
      !WORKSPACE_MODES.includes(data.workspaceMode)
    ) {
      throw new BadRequestException('Workspace mode must be GUIDED or FULL');
    }
    if (actor) updateData.updatedBy = actor;
    if (data.gstPercent !== undefined && Number(data.gstPercent) > 100) {
      throw new BadRequestException('GST percentage cannot exceed 100');
    }
    if (updateData.language && !['en', 'ta'].includes(updateData.language)) {
      throw new BadRequestException('Language must be en or ta');
    }
    // Invoices take the seller's state from the GSTIN, so a different state here would mislead staff.
    if (data.gstin !== undefined || data.sellerState !== undefined) {
      const gstin = data.gstin !== undefined ? data.gstin : settings.gstin;
      const state =
        data.sellerState !== undefined
          ? data.sellerState
          : settings.sellerState;
      if (data.sellerState) {
        const canonical = canonicalIndianState(data.sellerState);
        if (!canonical)
          throw new BadRequestException(
            'Choose an Indian state or union territory as the seller state',
          );
        updateData.sellerState = canonical;
      }
      const registered = gstinStateName(gstin);
      if (registered && state && canonicalIndianState(state) !== registered)
        throw new BadRequestException(
          `GSTIN ${String(gstin).toUpperCase()} is registered in ${registered}, not ${state}. Correct the GSTIN or the seller state.`,
        );
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
