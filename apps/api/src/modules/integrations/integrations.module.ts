import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { TallyModule } from './tally/tally.module';

@Module({
  imports: [TallyModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService, TallyModule],
})
export class IntegrationsModule {}
