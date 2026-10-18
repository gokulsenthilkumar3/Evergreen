import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { parseAdminSyncResponse } from './admin-sync-response.dto';

@Injectable()
export class AdminSyncService {
  private readonly logger = new Logger(AdminSyncService.name);

  private syncInProgress = false;

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
      const totalInvoices = await this.prisma.invoice.count();

      const metrics = {
        totalInwards,
        totalOutwards,
        totalInvoices,
        activeUsers,
      };

      const controller = new AbortController();
      // Keep the deadline active through reading the body, not just headers.
      timeout = setTimeout(() => {
        requestTimedOut = true;
        controller.abort();
      }, 10_000);
      failureContext = 'contacting the provider';
      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
        signal: controller.signal,
        redirect: 'error',
      });

      if (!response.ok) {
        failureContext = `provider returned HTTP ${response.status}`;
        await response.body?.cancel();
        throw new Error('Provider rejected sync');
      }

      failureContext = 'reading or validating the provider response';
      const payload: unknown = await response.json();
      controller.signal.throwIfAborted();
      const adminResponse = parseAdminSyncResponse(payload);
      clearTimeout(timeout);
      timeout = undefined;
      failureContext = 'updating local license settings';
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
