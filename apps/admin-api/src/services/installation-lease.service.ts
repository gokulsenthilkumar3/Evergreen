import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { refreshInstallationLease } from '@evergreen/types/licensing-online';
@Injectable()
export class InstallationLeaseService {
  private readonly logger = new Logger(InstallationLeaseService.name);
  @Cron(CronExpression.EVERY_HOUR)
  async renew() {
    try {
      await refreshInstallationLease('provider');
    } catch {
      this.logger.warn(
        'Licence renewal unavailable; signed offline limits remain in force.',
      );
    }
  }
}
