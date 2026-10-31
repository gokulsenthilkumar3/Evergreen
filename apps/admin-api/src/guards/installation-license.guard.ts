import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  ForbiddenException,
} from '@nestjs/common';
import { requireInstallationLicence } from '@evergreen/types/licensing';
@Injectable()
export class InstallationLicenseGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ method: string; path: string }>();
    if (req.method === 'POST' && req.path === '/licensing/lease') return true; // The issuer verifies the signed grant and device proof.
    if (req.method === 'GET' && req.path === '/license/status') return true;
    let licence;
    try {
      licence = requireInstallationLicence('provider');
    } catch {
      throw new ServiceUnavailableException(
        'Installation authorization required. Contact the EverGreen owner.',
      );
    }
    // Provider operations require an owner-issued ADMIN scope in addition to provider authentication.
    if (!licence.roles.includes('ADMIN'))
      throw new ForbiddenException(
        'Provider administration is not enabled by this licence',
      );
    return true;
  }
}
