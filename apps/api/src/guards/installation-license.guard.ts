import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  requireInstallationLicence,
  type InstallationLicence,
} from '@evergreen/types/licensing';
@Injectable()
export class InstallationLicenseGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      method: string;
      path: string;
      installationLicence?: InstallationLicence;
    }>();
    if (req.method === 'GET' && req.path === '/license/status') return true;
    try {
      req.installationLicence = requireInstallationLicence('tenant');
      return true;
    } catch {
      throw new ServiceUnavailableException(
        'Installation authorization required. Contact the EverGreen owner.',
      );
    }
  }
}
