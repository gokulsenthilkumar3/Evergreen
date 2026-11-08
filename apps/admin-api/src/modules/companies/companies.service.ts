import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import * as crypto from 'crypto';
import { resolveTxt } from 'node:dns/promises';
import type { Prisma } from '@prisma/admin-client';
import {
  CreateCompanyDto,
  CreateCompanyDomainDto,
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

  private normalizeHostname(hostname: string) {
    const normalized = hostname.trim().toLowerCase().replace(/\.$/, '');
    if (!normalized || normalized.includes('/') || normalized.includes(':')) {
      throw new BadRequestException('A hostname is required, not a URL');
    }
    return normalized;
  }

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
        lastSyncAt: now,
      };
      if (metrics.billingPeriod !== undefined || metrics.periodDocsPosted !== undefined) {
        if (metrics.billingPeriod !== now.toISOString().slice(0, 7) ||
            !Number.isSafeInteger(metrics.periodDocsPosted) || metrics.periodDocsPosted! < 0 || metrics.periodDocsPosted! > MAX_COUNTER) {
          throw new BadRequestException('Billing usage must identify the current UTC month and a valid document count');
        }
        updateData.docsPosted = metrics.periodDocsPosted;
      }
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

  async listDomains(companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) throw new NotFoundException('Company not found');
    return this.prisma.$queryRawUnsafe(
      'SELECT id, companyId, hostname, kind, verificationToken, isPrimary, verifiedAt, createdAt, updatedAt FROM CompanyDomain WHERE companyId = ? ORDER BY isPrimary DESC, hostname ASC',
      companyId,
    );
  }

  async addDomain(companyId: string, data: CreateCompanyDomainDto) {
    const hostname = this.normalizeHostname(data.hostname);
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) throw new NotFoundException('Company not found');
    try {
      return await this.prisma.$transaction(async tx => {
        if (data.isPrimary) await tx.$executeRawUnsafe('UPDATE CompanyDomain SET isPrimary = 0 WHERE companyId = ?', companyId);
        const id = crypto.randomUUID();
        const verificationToken = `evergreen-domain-${crypto.randomBytes(24).toString('hex')}`;
        const now = new Date().toISOString();
        await tx.$executeRawUnsafe(
          'INSERT INTO CompanyDomain (id, companyId, hostname, kind, verificationToken, isPrimary, verifiedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)',
          id, companyId, hostname, data.kind || 'SUBDOMAIN', verificationToken, data.isPrimary ? 1 : 0, now, now,
        );
        return { id, companyId, hostname, kind: data.kind || 'SUBDOMAIN', verificationToken, isPrimary: data.isPrimary ?? false, verifiedAt: null, createdAt: now, updatedAt: now };
      });
    } catch (error) {
      if (error instanceof Error && /unique|constraint/i.test(error.message)) {
        throw new BadRequestException('That hostname is already assigned to a company');
      }
      throw error;
    }
  }

  async removeDomain(companyId: string, domainId: string) {
    const deleted = await this.prisma.$executeRawUnsafe('DELETE FROM CompanyDomain WHERE id = ? AND companyId = ?', domainId, companyId);
    if (deleted !== 1) throw new NotFoundException('Company domain not found');
    return { deleted: true, id: domainId };
  }

  async resolveDomain(hostname: string) {
    const normalized = this.normalizeHostname(hostname.trim().replace(/:\d+$/, ''));
    const rows = await this.prisma.$queryRawUnsafe<Array<{ hostname: string; kind: string; isPrimary: boolean; companyId: string; companyName: string; deploymentUrl: string | null; status: string; isMaintenance: boolean }>>(
      'SELECT d.hostname, d.kind, d.isPrimary, c.id AS companyId, c.name AS companyName, c.deploymentUrl, c.status, c.isMaintenance FROM CompanyDomain d INNER JOIN Company c ON c.id = d.companyId WHERE d.hostname = ? AND d.verifiedAt IS NOT NULL LIMIT 1',
      normalized,
    );
    const domain = rows[0];
    if (!domain || domain.status === 'SUSPENDED') return null;
    return {
      hostname: domain.hostname,
      kind: domain.kind,
      isPrimary: domain.isPrimary,
      companyId: domain.companyId,
      companyName: domain.companyName,
      deploymentUrl: domain.deploymentUrl,
      status: domain.status,
      isMaintenance: domain.isMaintenance,
    };
  }

  async verifyDomain(companyId: string, domainId: string) {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ id: string; hostname: string; verificationToken: string }>>(
      'SELECT id, hostname, verificationToken FROM CompanyDomain WHERE id = ? AND companyId = ? LIMIT 1',
      domainId, companyId,
    );
    const domain = rows[0];
    if (!domain) throw new NotFoundException('Company domain not found');
    const record = `_evergreen-verification.${domain.hostname}`;
    let values: string[] = [];
    try {
      values = (await resolveTxt(record)).flat();
    } catch {
      throw new ServiceUnavailableException(`DNS verification record not found at ${record}`);
    }
    if (!values.includes(domain.verificationToken)) {
      throw new BadRequestException('DNS verification record does not match the issued token');
    }
    const verifiedAt = new Date().toISOString();
    await this.prisma.$executeRawUnsafe('UPDATE CompanyDomain SET verifiedAt = ?, updatedAt = ? WHERE id = ?', verifiedAt, verifiedAt, domainId);
    return { id: domain.id, hostname: domain.hostname, verifiedAt };
  }
}
