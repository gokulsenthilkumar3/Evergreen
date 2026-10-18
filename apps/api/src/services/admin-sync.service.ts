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

  private getSyncUrl(): string | undefined {
    const baseUrl = process.env.ADMIN_API_URL?.trim();
    const companyId = process.env.COMPANY_ID?.trim();
    // Local installations must not collect or send metrics until configured.
    if (!baseUrl && !companyId) return undefined;
    if (!baseUrl || !companyId) {
      this.logger.warn(
        'Provider sync disabled: configure both ADMIN_API_URL and COMPANY_ID.',
      );
      return undefined;
    }

    try {
      const url = new URL(baseUrl);
      const localDevelopment =
        process.env.NODE_ENV !== 'production' &&
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      if (
        (url.protocol !== 'https:' && !localDevelopment) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        !/^[a-zA-Z0-9_-]{1,128}$/.test(companyId)
      ) {
        throw new Error('Invalid provider sync configuration');
      }
      url.pathname = `${url.pathname.replace(/\/+$/, '')}/companies/${companyId}/sync`;
      return url.toString();
    } catch {
      // Configuration values may contain credentials; never echo them.
      this.logger.warn(
        'Provider sync disabled: ADMIN_API_URL must use HTTPS (loopback HTTP is allowed outside production), contain no credentials, query or fragment, and COMPANY_ID must contain 1-128 letters, digits, underscores or hyphens.',
      );
      return undefined;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncMetrics() {
    if (this.syncInProgress) return;
    const syncUrl = this.getSyncUrl();
    if (!syncUrl) return;

    this.syncInProgress = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let requestTimedOut = false;
    let failureContext = 'reading local metrics';
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
        failureContext = `provider returned HTTP ${response.status}`;
        await response.body?.cancel();
        throw new Error('Provider rejected sync');
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
          } else {
            effectiveStatus = 'ACTIVE';
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
    } catch {
      this.logger.error(
        `Provider sync failed: ${requestTimedOut ? 'request timed out after 10 seconds' : failureContext}.`,
      );
    } finally {
      clearTimeout(timeout);
      this.syncInProgress = false;
    }
  }
}
