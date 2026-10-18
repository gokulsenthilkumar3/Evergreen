import { ServiceUnavailableException } from '@nestjs/common';
import { CicdService } from './cicd.service';
import { PrismaService } from '../../services/prisma.service';

describe('CicdService', () => {
  let service: CicdService;
  const originalEnv = { ...process.env };
  afterEach(() => { process.env = { ...originalEnv }; });

  beforeEach(() => {
    delete process.env.EVERGREEN_GITHUB_REPOSITORY;
    delete process.env.EVERGREEN_GITHUB_TOKEN;
    service = new CicdService({} as PrismaService);
  });

  it('does not expose bundled release, deployment, or log examples', async () => {
    await expect(service.getPackages()).resolves.toEqual([]);
    await expect(service.getDeployments()).resolves.toEqual([]);
    await expect(service.getLogs()).resolves.toEqual([]);
  });

  it('refuses to claim a build succeeded without a configured provider', async () => {
    await expect(service.triggerBuild({ version: '1.0.0', name: 'Release', changelog: '', requestKey: '11111111-1111-4111-8111-111111111111' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('refuses to claim a deployment started without a configured provider', async () => {
    await expect(service.deployPackage({ packageVersion: 'v1.0.0', companyId: 'company-1', requestKey: '11111111-1111-4111-8111-111111111111' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(service.getDeployments()).resolves.toEqual([]);
  });
});
