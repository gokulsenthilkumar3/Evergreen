import { Controller, Post, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ProviderAdminGuard } from '../../guards/provider-admin.guard';
import { execSync } from 'child_process';

@Controller('admin-ops')
export class AdminOpsController {
  
  @Post('migrate')
  @UseGuards(ProviderAdminGuard)
  async runMigration() {
    try {
      console.log('🔄 Running admin-triggered database migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      return { status: 'Migration Applied successfully' };
    } catch (error) {
      throw new HttpException(
        'Migration failed to apply. See server logs.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
