import { ServiceUnavailableException } from '@nestjs/common';
import { CicdService } from './cicd.service';

describe('CicdService', () => {
  let service: CicdService;

  beforeEach(() => {
    service = new CicdService();
  });

  it('does not expose bundled release, deployment, or log examples', () => {
    expect(service.getPackages()).toEqual([]);
    expect(service.getDeployments()).toEqual([]);
    expect(service.getLogs()).toEqual([]);
  });

  it('refuses to claim a build succeeded without a configured provider', async () => {
    await expect(service.triggerBuild({ version: '1.0.0', name: 'Release', changelog: '' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('refuses to claim a deployment started without a configured provider', async () => {
    await expect(service.deployPackage({ packageVersion: 'v1.0.0', companyId: 'company-1' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(service.getDeployments()).toEqual([]);
  });
});
