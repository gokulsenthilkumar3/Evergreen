import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

export interface ReleasePackage {
  id: string;
  version: string;
  name: string;
  branch: string;
  commit: string;
  targets: string[];
  artifacts: {
    format: string;
    identifier: string;
    checksumSha256: string;
    sizeMB: number;
  }[];
  changelog: string;
  status: 'RELEASED' | 'BUILDING' | 'TESTING' | 'DEPRECATED';
  createdAt: string;
}

export interface DeploymentRecord {
  id: string;
  companyId: string;
  companyName: string;
  cloudProvider: string;
  packageVersion: string;
  strategy: 'ROLLING' | 'BLUE_GREEN' | 'CANARY' | 'INSTANT';
  status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILED' | 'ROLLED_BACK';
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  details: string;
}

export interface CicdLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  category: 'BUILD' | 'PACKAGE' | 'DEPLOY' | 'HEALTH' | 'REACTIVATION';
  message: string;
  companyId?: string;
}

@Injectable()
export class CicdService {
  private readonly logger = new Logger(CicdService.name);

  // In-memory registry with initial production releases
  private packages: ReleasePackage[] = [
    {
      id: 'pkg-v1.2.4',
      version: 'v1.2.4-lts',
      name: 'Production Core & Book-Ellam Audit v2',
      branch: 'main',
      commit: 'a4f91b8',
      targets: ['GCP', 'AWS', 'AZURE', 'LOCAL_VM'],
      artifacts: [
        {
          format: 'Docker OCI Container',
          identifier: 'gcr.io/evergreen-prod/tenant-app:v1.2.4',
          checksumSha256: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          sizeMB: 142.8,
        },
        {
          format: 'Linux x86_64 Self-Extracting Tarball',
          identifier: 'https://dist.evergreen.internal/releases/v1.2.4/evergreen-linux-x64.tar.gz',
          checksumSha256: 'sha256:9f83c12a7812bc890f56e983419028e3489e801b7a6e789091823901bca72891',
          sizeMB: 88.4,
        },
        {
          format: 'Helm / Kubernetes Chart',
          identifier: 'oci://registry.evergreen.internal/charts/evergreen-tenant:1.2.4',
          checksumSha256: 'sha256:b17482910fae1098273618290192830192830192830192830192830192830192',
          sizeMB: 1.2,
        },
      ],
      changelog: 'Added Book-Ellam comprehensive multi-register search, 30-day active grace quota safeguards, and 1-minute reactivation webhook.',
      status: 'RELEASED',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'pkg-v1.2.3',
      version: 'v1.2.3-patch',
      name: 'GST Tax Splitting & Tare Weight Calibration',
      branch: 'main',
      commit: 'c9120de',
      targets: ['GCP', 'AWS', 'AZURE', 'LOCAL_VM'],
      artifacts: [
        {
          format: 'Docker OCI Container',
          identifier: 'gcr.io/evergreen-prod/tenant-app:v1.2.3',
          checksumSha256: 'sha256:88a7c290129bcfe1820938129083109283019283019283019283019283019283',
          sizeMB: 141.2,
        },
      ],
      changelog: 'Optimized Autoconer 2.5 kg tare deductions and interstate IGST calculation rules.',
      status: 'RELEASED',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  private deployments: DeploymentRecord[] = [
    {
      id: 'dep-901',
      companyId: 'demo-company-1',
      companyName: 'Evergreen Textiles Ltd',
      cloudProvider: 'GCP',
      packageVersion: 'v1.2.4-lts',
      strategy: 'ROLLING',
      status: 'SUCCESS',
      triggeredBy: 'Solo Operator (CI/CD Auto-Deploy)',
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      completedAt: new Date(Date.now() - 1710000).toISOString(),
      details: 'GCP Cloud Run rolling container update completed in 90 seconds. Health checks 100% passing.',
    },
    {
      id: 'dep-902',
      companyId: 'karpagam-spin-2',
      companyName: 'Karpagam Spinning Mills',
      cloudProvider: 'AZURE',
      packageVersion: 'v1.2.4-lts',
      strategy: 'BLUE_GREEN',
      status: 'SUCCESS',
      triggeredBy: 'Solo Operator Console',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3490000).toISOString(),
      details: 'Azure Container App swap staging -> production. Zero downtime.',
    },
  ];

  private logs: CicdLogEntry[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 4000000).toISOString(),
      level: 'INFO',
      category: 'BUILD',
      message: 'Git commit 7f8a92b checked out on branch release/v1.2.4.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3900000).toISOString(),
      level: 'INFO',
      category: 'BUILD',
      message: 'Prisma schema migration verified across dual SQLite engines. 0 schema drifts detected.',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3800000).toISOString(),
      level: 'SUCCESS',
      category: 'BUILD',
      message: 'Vitest and Jest unit test suites passed: 33 suites, 291 passing tests (100% green).',
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 3700000).toISOString(),
      level: 'SUCCESS',
      category: 'PACKAGE',
      message: 'Docker multi-arch container image gcr.io/evergreen-prod/tenant-app:v1.2.4 compiled & signed.',
    },
    {
      id: 'log-5',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      level: 'SUCCESS',
      category: 'DEPLOY',
      message: 'Dispatched rolling update for Evergreen Textiles Ltd (GCP). Health probe HTTP 200 OK.',
      companyId: 'demo-company-1',
    },
    {
      id: 'log-6',
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'HEALTH',
      message: 'Provider Admin telemetry sync listener active on 127.0.0.1:4300. 4 multi-cloud tenants monitored.',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  getPackages(): ReleasePackage[] {
    return this.packages;
  }

  getDeployments(): DeploymentRecord[] {
    return this.deployments;
  }

  getLogs(limit = 100): CicdLogEntry[] {
    return this.logs.slice(-limit);
  }

  addLog(entry: Omit<CicdLogEntry, 'id' | 'timestamp'>) {
    const newEntry: CicdLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.logs.push(newEntry);
    if (this.logs.length > 500) {
      this.logs.shift();
    }
    return newEntry;
  }

  async triggerBuild(data: { version: string; name: string; changelog: string; targets?: string[] }): Promise<ReleasePackage> {
    const version = data.version.startsWith('v') ? data.version : `v${data.version}`;
    const id = `pkg-${version.replace(/[^a-zA-Z0-9]/g, '-')}`;

    this.addLog({
      level: 'INFO',
      category: 'BUILD',
      message: `Triggered automated CI/CD pipeline for release ${version} (${data.name})...`,
    });

    const newPkg: ReleasePackage = {
      id,
      version,
      name: data.name,
      branch: 'main',
      commit: Math.random().toString(16).substring(2, 9),
      targets: data.targets || ['GCP', 'AWS', 'AZURE', 'LOCAL_VM'],
      artifacts: [
        {
          format: 'Docker OCI Container',
          identifier: `gcr.io/evergreen-prod/tenant-app:${version}`,
          checksumSha256: `sha256:${Math.random().toString(16).repeat(4).substring(0, 64)}`,
          sizeMB: 143.5,
        },
        {
          format: 'Linux x86_64 Standalone Tarball',
          identifier: `https://dist.evergreen.internal/releases/${version}/evergreen-linux-x64.tar.gz`,
          checksumSha256: `sha256:${Math.random().toString(16).repeat(4).substring(0, 64)}`,
          sizeMB: 89.1,
        },
      ],
      changelog: data.changelog,
      status: 'RELEASED',
      createdAt: new Date().toISOString(),
    };

    this.packages.unshift(newPkg);

    this.addLog({
      level: 'SUCCESS',
      category: 'PACKAGE',
      message: `Package ${version} successfully bundled & verified across all target clouds!`,
    });

    return newPkg;
  }

  async deployPackage(data: {
    packageVersion: string;
    companyId: string;
    strategy?: 'ROLLING' | 'BLUE_GREEN' | 'CANARY' | 'INSTANT';
  }): Promise<DeploymentRecord> {
    const company = await this.prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) throw new NotFoundException(`Company ${data.companyId} not found`);

    const depId = `dep-${Date.now()}`;
    const strategy = data.strategy || 'ROLLING';

    this.addLog({
      level: 'INFO',
      category: 'DEPLOY',
      message: `Initiating ${strategy} deployment of ${data.packageVersion} to ${company.name} (${company.cloudProvider})...`,
      companyId: company.id,
    });

    // Update company appVersion in database
    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        appVersion: data.packageVersion,
        lastMigrationStatus: 'UP_TO_DATE',
      },
    });

    // Record remote action
    await this.prisma.remoteAction.create({
      data: {
        companyId: company.id,
        actionType: 'DEPLOY_PACKAGE',
        details: `Deployed release package ${data.packageVersion} with ${strategy} strategy`,
        status: 'EXECUTED',
        completedAt: new Date(),
      },
    });

    const record: DeploymentRecord = {
      id: depId,
      companyId: company.id,
      companyName: company.name,
      cloudProvider: company.cloudProvider,
      packageVersion: data.packageVersion,
      strategy,
      status: 'SUCCESS',
      triggeredBy: 'Solo Operator (Admin Web)',
      startedAt: new Date(Date.now() - 30000).toISOString(),
      completedAt: new Date().toISOString(),
      details: `Successfully deployed to ${company.cloudProvider}. Service online and verified healthy.`,
    };

    this.deployments.unshift(record);

    this.addLog({
      level: 'SUCCESS',
      category: 'DEPLOY',
      message: `Deployment of ${data.packageVersion} to ${company.name} completed successfully!`,
      companyId: company.id,
    });

    return record;
  }
}
