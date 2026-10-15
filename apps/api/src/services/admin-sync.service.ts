import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { parseAdminSyncResponse } from './admin-sync-response.dto';

@Injectable()
export class AdminSyncService {
  private readonly logger = new Logger(AdminSyncService.name);

  // Hardcoded for demo; in production this comes from env / settings
  private readonly adminApiUrl = 'http://localhost:4300';
  private readonly companyId = process.env.COMPANY_ID || 'demo-company-1';

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncMetrics() {
    this.logger.log('Syncing metrics to Provider Admin Portal...');
    try {
      const activeUsers = await this.prisma.user.count({
        where: { sessions: { some: { isValid: true } } },
      });

      const totalInwards = await this.prisma.inwardBatch.count();
      const totalOutwards = await this.prisma.outward.count();
      // Note: invoices would be counted here but for simplicity we rely on outwards

      const metrics = {
        totalInwards,
        totalOutwards,
        totalInvoices: totalOutwards, // approximated
        activeUsers,
      };

      const response = await fetch(
        `${this.adminApiUrl}/companies/${this.companyId}/sync`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics),
        },
      );

      if (!response.ok) {
        throw new Error(`Admin API returned ${response.status}`);
      }

      const payload: unknown = await response.json();
      const adminResponse = parseAdminSyncResponse(payload);
      const settings = await this.prisma.systemSettings.findFirst();
      if (settings) {
        const now = new Date();
        let effectiveStatus = adminResponse.status;
        const expiry =
          adminResponse.expiresAt === null
            ? null
            : new Date(adminResponse.expiresAt);
        const graceExpiresAt =
          expiry === null
            ? null
            : new Date(
                expiry.getTime() +
                  adminResponse.gracePeriodDays * 24 * 60 * 60 * 1000,
              );

        // Provider suspension takes precedence over date-derived licensing.
        // An active renewal can still recover a locally expired license.
        if (effectiveStatus !== 'SUSPENDED' && expiry && graceExpiresAt) {
          if (now > expiry) {
            if (now <= graceExpiresAt) {
              effectiveStatus = 'GRACE_PERIOD';
            } else {
              effectiveStatus = 'SUSPENDED';
            }
          } else {
            effectiveStatus = 'ACTIVE';
          }
        }

        await this.prisma.systemSettings.update({
          where: { id: settings.id },
          data: {
            plan: adminResponse.plan,
            pricingModel: adminResponse.pricingModel,
            status: effectiveStatus,
            licenseExpiresAt: expiry,
            gracePeriodDays: adminResponse.gracePeriodDays,
            graceExpiresAt,
            maxUsers: adminResponse.maxUsers,
            maxMachines: adminResponse.maxMachines,
            maxDocsPerMonth: adminResponse.maxDocsPerMonth,
            allowedModules: adminResponse.allowedModules,
            tier: adminResponse.tier,
            isMaintenance: adminResponse.isMaintenance,
          },
        });
        this.logger.log(
          `Licensing updated: ${adminResponse.plan} [${effectiveStatus}] | Pricing: ${adminResponse.pricingModel} | Quotas: users=${adminResponse.maxUsers}, machines=${adminResponse.maxMachines}`,
        );
      }

      this.logger.log('Metrics synced successfully.');
    } catch (e) {
      this.logger.error('Failed to sync metrics to Admin Portal', e);
    }
  }
}
