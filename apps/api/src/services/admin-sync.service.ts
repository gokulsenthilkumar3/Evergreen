import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

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

      const adminResponse = await response.json();

      if (
        adminResponse &&
        (adminResponse.plan || adminResponse.status || adminResponse.tier)
      ) {
        const settings = await this.prisma.systemSettings.findFirst();
        if (settings) {
          const now = new Date();
          let effectiveStatus = adminResponse.status || settings.status;

          // 7-Day Active Grace Quota Logic
          let graceExpiresAt: Date | null = null;
          if (adminResponse.expiresAt) {
            const expiry = new Date(adminResponse.expiresAt);
            const graceDays =
              adminResponse.gracePeriodDays ?? settings.gracePeriodDays ?? 7;
            graceExpiresAt = new Date(
              expiry.getTime() + graceDays * 24 * 60 * 60 * 1000,
            );

            if (now > expiry) {
              if (now <= graceExpiresAt) {
                // Within 7-day grace: NOT BLOCKED from daily operations, flagged for renewal
                effectiveStatus = 'GRACE_PERIOD';
                this.logger.warn(
                  `Tenant operating under 7-Day Active Grace Period until ${graceExpiresAt.toISOString()}`,
                );
              } else {
                // Grace period elapsed: lock access
                effectiveStatus = 'SUSPENDED';
                this.logger.error(
                  `Tenant 7-Day Grace Period elapsed. Service suspended.`,
                );
              }
            } else if (
              effectiveStatus === 'GRACE_PERIOD' ||
              effectiveStatus === 'SUSPENDED'
            ) {
              effectiveStatus = 'ACTIVE';
            }
          }

          await this.prisma.systemSettings.update({
            where: { id: settings.id },
            data: {
              plan: adminResponse.plan || settings.plan,
              pricingModel: adminResponse.pricingModel || settings.pricingModel,
              status: effectiveStatus,
              licenseExpiresAt: adminResponse.expiresAt
                ? new Date(adminResponse.expiresAt)
                : settings.licenseExpiresAt,
              gracePeriodDays:
                adminResponse.gracePeriodDays ?? settings.gracePeriodDays ?? 7,
              graceExpiresAt,
              maxUsers:
                adminResponse.maxUsers !== undefined
                  ? adminResponse.maxUsers
                  : settings.maxUsers,
              maxMachines:
                adminResponse.maxMachines !== undefined
                  ? adminResponse.maxMachines
                  : settings.maxMachines,
              maxDocsPerMonth:
                adminResponse.maxDocsPerMonth !== undefined
                  ? adminResponse.maxDocsPerMonth
                  : settings.maxDocsPerMonth,
              allowedModules:
                adminResponse.allowedModules || settings.allowedModules,
              tier: adminResponse.tier || settings.tier,
              isMaintenance:
                adminResponse.isMaintenance !== undefined
                  ? adminResponse.isMaintenance
                  : settings.isMaintenance,
            },
          });
          this.logger.log(
            `Licensing updated: ${adminResponse.plan} [${effectiveStatus}] | Pricing: ${adminResponse.pricingModel || 'TIERED'} | Quotas: users=${adminResponse.maxUsers ?? settings.maxUsers}, machines=${adminResponse.maxMachines ?? settings.maxMachines}`,
          );
        }
      }

      this.logger.log('Metrics synced successfully.');
    } catch (e) {
      this.logger.error('Failed to sync metrics to Admin Portal', e);
    }
  }
}
