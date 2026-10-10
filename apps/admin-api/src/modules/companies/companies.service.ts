import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(data: { 
    name: string; 
    plan?: string; 
    businessMode?: string; 
    workspaceMode?: string; 
    cloudProvider?: string; 
    appVersion?: string; 
    deploymentUrl?: string;
    tier?: string;
    state?: string;
    country?: string;
    maxUsers?: number;
    maxMachines?: number;
    maxDocsPerMonth?: number;
    allowedModules?: string;
  }) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const licenseKey = `EVG-${(data.tier || 'T2').substring(0, 2).toUpperCase()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    return this.prisma.company.create({
      data: {
        ...data,
        cloudProvider: data.cloudProvider || 'LOCAL_VM',
        apiKey,
        licenseKey,
        tier: data.tier || 'TIER_2_CITY',
        state: data.state || 'Tamil Nadu',
        country: data.country || 'IN',
        maxUsers: data.maxUsers !== undefined ? data.maxUsers : 1,
        maxMachines: data.maxMachines !== undefined ? data.maxMachines : 5,
        maxDocsPerMonth: data.maxDocsPerMonth !== undefined ? data.maxDocsPerMonth : 500,
        allowedModules: data.allowedModules || 'CORE,INVENTORY,COMMERCE',
      },
    });
  }

  async getCompanies() {
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 1
        },
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  async getCompany(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateLicense(id: string, data: {
    plan?: string;
    status?: string;
    tier?: string;
    state?: string;
    country?: string;
    maxUsers?: number;
    maxMachines?: number;
    maxDocsPerMonth?: number;
    allowedModules?: string;
    expiresAt?: Date | string;
    isMaintenance?: boolean;
  }) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');

    const updatePayload: any = { ...data };
    if (data.expiresAt) {
      updatePayload.expiresAt = new Date(data.expiresAt);
    }

    return this.prisma.company.update({
      where: { id },
      data: updatePayload,
    });
  }

  async executeRemoteAction(companyId: string, actionType: string, details?: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    const action = await this.prisma.remoteAction.create({
      data: {
        companyId,
        actionType,
        details: details || `Triggered action ${actionType} from provider console`,
        status: 'EXECUTED',
        completedAt: new Date(),
      }
    });

    if (actionType === 'TOGGLE_MAINTENANCE') {
      await this.prisma.company.update({
        where: { id: companyId },
        data: { isMaintenance: !company.isMaintenance }
      });
    } else if (actionType === 'TRIGGER_MIGRATION') {
      await this.prisma.company.update({
        where: { id: companyId },
        data: { lastMigrationStatus: 'MIGRATION_QUEUED' }
      });
    }

    return action;
  }

  async updateMetrics(companyId: string, metrics: { totalInwards: number; totalOutwards: number; totalInvoices: number; activeUsers: number; appVersion?: string; additionalMetrics?: any }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metricsData = {
      totalInwards: metrics.totalInwards || 0,
      totalOutwards: metrics.totalOutwards || 0,
      totalInvoices: metrics.totalInvoices || 0,
      activeUsers: metrics.activeUsers || 0,
      additionalMetrics: metrics.additionalMetrics ? JSON.stringify(metrics.additionalMetrics) : null,
    };

    await this.prisma.companyMetrics.upsert({
      where: {
        companyId_date: {
          companyId,
          date: today,
        }
      },
      update: metricsData,
      create: {
        companyId,
        date: today,
        ...metricsData
      }
    });

    const updateData: any = {
      activeStaff: metrics.activeUsers || 0,
      docsPosted: (metrics.totalInwards || 0) + (metrics.totalOutwards || 0) + (metrics.totalInvoices || 0),
      lastSyncAt: new Date()
    };
    if (metrics.appVersion) {
      updateData.appVersion = metrics.appVersion;
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: { 
        plan: true, 
        status: true,
        tier: true,
        maxUsers: true,
        maxMachines: true,
        maxDocsPerMonth: true,
        allowedModules: true,
        isMaintenance: true,
        expiresAt: true,
        lastMigrationStatus: true,
      }
    });

    return { 
      success: true, 
      ...updatedCompany,
    };
  }
}
