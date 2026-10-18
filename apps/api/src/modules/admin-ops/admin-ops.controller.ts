import {
  Controller,
  Post,
  UseGuards,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ProviderAdminGuard } from '../../guards/provider-admin.guard';

@Controller('admin-ops')
export class AdminOpsController {
  @Post('migrate')
  @UseGuards(ProviderAdminGuard)
  runMigration() {
    throw new ServiceUnavailableException('Use the release deployment workflow for database migrations. No migration was started by this request.');
  }
}
