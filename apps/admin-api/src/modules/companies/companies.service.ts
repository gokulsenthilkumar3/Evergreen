import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import * as crypto from 'crypto';
import type { Prisma } from '@prisma/admin-client';
import {
  CreateCompanyDto,
  MAX_COUNTER,
  SyncCompanyDto,
  UpdateLicenseDto,
} from './companies.dto';

function withoutEnrollmentKey<T extends { apiKey: string }>(
  company: T,
): Omit<T, 'apiKey'> {
  const { apiKey: _apiKey, ...visible } = company;
  void _apiKey;
  return visible;
}

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(data: CreateCompanyDto) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const licenseKey = `EVG-${(data.tier || 'T2').substring(0, 2).toUpperCase()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    return this.prisma.company.create({
      data: {
        name: data.name,
        plan: data.plan,
        pricingModel: data.pricingModel,
        businessMode: data.businessMode,
        workspaceMode: data.workspaceMode,
        appVersion: data.appVersion,
        deploymentUrl: data.deploymentUrl,
        gracePeriodDays: data.gracePeriodDays,
        cloudProvider: data.cloudProvider || 'LOCAL_VM',
        apiKey,
        licenseKey,
        tier: data.tier || 'TIER_2_CITY',
        state: data.state || 'Tamil Nadu',
        country: data.country || 'IN',
        maxUsers: data.maxUsers !== undefined ? data.maxUsers : 1,
        maxMachines: data.maxMachines !== undefined ? data.maxMachines : 5,
        maxDocsPerMonth:
          data.maxDocsPerMonth !== undefined ? data.maxDocsPerMonth : 500,
        allowedModules: data.allowedModules || 'CORE,INVENTORY,COMMERCE',
      },
    });
  }

  async getCompanies() {
    const companies = await this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    return companies.map(withoutEnrollmentKey);
  }

  async getCompany(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return withoutEnrollmentKey(company);
  }

  async updateLicense(
    id: string,
    data: UpdateLicenseDto,
    actor = 'Provider operator',
  ) {
    const dateValue = (value: string | null | undefined) => {
      if (value === undefined || value === null) return value;
      const parsed = new Date(value);
      if (!Number.isFinite(parsed.getTime()))
        throw new BadRequestException('Invalid license date');
      return parsed;
    };
    const updatePayload: Prisma.CompanyUpdateInput = {
      plan: data.plan,
      pricingModel: data.pricingModel,
      status: data.status,
      tier: data.tier,
      state: data.state,
      country: data.country,
      maxUsers: data.maxUsers,
      maxMachines: data.maxMachines,
      maxDocsPerMonth: data.maxDocsPerMonth,
      allowedModules: data.allowedModules,
      gracePeriodDays: data.gracePeriodDays,
      expiresAt: dateValue(data.expiresAt),
      graceExpiresAt: dateValue(data.graceExpiresAt),
      isMaintenance: data.isMaintenance,
    };
    const fields = Object.keys(updatePayload).filter(
      (key) => updatePayload[key as keyof typeof updatePayload] !== undefined,
    );
    if (!fields.length)
      throw new BadRequestException(
        'At least one license field must be supplied',
      );
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({ where: { id } });
      if (!company) throw new NotFoundException('Company not found');
      const updated = await tx.company.update({
        where: { id },
        data: updatePayload,
      });
      await tx.controlAudit.create({
        data: {
          actor,
          action: 'UPDATE_LICENSE',
          details: JSON.stringify({
            companyId: id,
            fields,
            reason: data.details || null,
          }),
        },
      });
      return withoutEnrollmentKey(updated);
    });
  }

  async executeRemoteAction(
    companyId: string,
    actionType: string,
    details?: string,
  ) {
    const supportedRequests = [
      'TOGGLE_MAINTENANCE',
      'TRIGGER_MIGRATION',
      'FORCE_SYNC',
      'REFRESH_LICENSE',
      'SYNC_TALLY',
      'RESTART_SERVICE',
    ];
    if (!supportedRequests.includes(actionType)) {
      throw new BadRequestException('Unknown remote action');
    }
    if (
      details !== undefined &&
      (typeof details !== 'string' || details.length > 1000)
    ) {
      throw new BadRequestException(
        'Action details must be a string of at most 1000 characters',
      );
    }
    if (actionType !== 'TOGGLE_MAINTENANCE') {
      throw new ServiceUnavailableException(
        'Remote execution provider is not configured; no action was queued or executed',
      );
    }

    // This changes provider configuration only. Tenant acknowledgement requires
    // a separate authenticated delivery mechanism and must not be fabricated.
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({ where: { id: companyId } });
      if (!company) throw new NotFoundException('Company not found');
      await tx.company.update({
        where: { id: companyId },
        data: { isMaintenance: !company.isMaintenance },
      });
      return tx.remoteAction.create({
        data: {
          companyId,
          actionType,
          details: `Provider maintenance preference saved; tenant application is unconfirmed.${details ? ` ${details}` : ''}`,
          status: 'EXECUTED',
          completedAt: new Date(),
        },
      });
    });
  }

  async updateMetrics(companyId: string, metrics: SyncCompanyDto) {
    const counters = [
      metrics.totalInwards,
      metrics.totalOutwards,
      metrics.totalInvoices,
      metrics.activeUsers,
    ];
    const docsPosted =
      metrics.totalInwards + metrics.totalOutwards + metrics.totalInvoices;
    if (
      counters.some(
        (value) => !Number.isInteger(value) || value < 0 || value > MAX_COUNTER,
      ) ||
      docsPosted > MAX_COUNTER
    ) {
      throw new BadRequestException(
        'Metrics exceed the supported nonnegative integer range',
      );
    }
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const metricsData = {
      totalInwards: metrics.totalInwards,
      totalOutwards: metrics.totalOutwards,
      totalInvoices: metrics.totalInvoices,
      activeUsers: metrics.activeUsers,
    };

    return this.prisma.$transaction(async (tx) => {
      if (
        !(await tx.company.findUnique({
          where: { id: companyId },
          select: { id: true },
        }))
      ) {
        throw new NotFoundException('Company not found');
      }
      await tx.companyMetrics.upsert({
        where: { companyId_date: { companyId, date: today } },
        update: metricsData,
        create: { companyId, date: today, ...metricsData },
      });

      const updateData: Prisma.CompanyUpdateInput = {
        activeStaff: metrics.activeUsers,
        docsPosted,
        lastSyncAt: now,
      };
      if (metrics.appVersion) {
        updateData.appVersion = metrics.appVersion;
      }

      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: updateData,
        select: {
          plan: true,
          pricingModel: true,
          gracePeriodDays: true,
          status: true,
          tier: true,
          maxUsers: true,
          maxMachines: true,
          maxDocsPerMonth: true,
          allowedModules: true,
          isMaintenance: true,
          expiresAt: true,
          lastMigrationStatus: true,
        },
      });

      return { success: true, ...updatedCompany };
    });
  }
}
