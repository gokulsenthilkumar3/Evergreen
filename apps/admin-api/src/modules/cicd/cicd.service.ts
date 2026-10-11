import { Injectable, ServiceUnavailableException } from '@nestjs/common';

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
  // An empty registry is intentional until a real build provider is connected.
  // No release metadata or execution success may be synthesized by this API.
  getPackages(): ReleasePackage[] {
    return [];
  }

  getDeployments(): DeploymentRecord[] {
    return [];
  }

  getLogs(_limit = 100): CicdLogEntry[] {
    return [];
  }

  triggerBuild(_data: {
    version: string;
    name: string;
    changelog: string;
    targets?: string[];
  }): Promise<ReleasePackage> {
    return Promise.reject(
      new ServiceUnavailableException(
        'CI/CD build provider is not configured; no release was created',
      ),
    );
  }

  deployPackage(_data: {
    packageVersion: string;
    companyId: string;
    strategy?: 'ROLLING' | 'BLUE_GREEN' | 'CANARY' | 'INSTANT';
  }): Promise<DeploymentRecord> {
    return Promise.reject(
      new ServiceUnavailableException(
        'CI/CD deployment provider is not configured; no deployment was started',
      ),
    );
  }
}
