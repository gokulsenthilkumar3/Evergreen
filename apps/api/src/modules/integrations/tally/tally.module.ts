import { Module } from '@nestjs/common';
import { TallyExportService } from './tally.service';
import { TallyExportController } from './tally.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TallyExportController],
  providers: [TallyExportService],
  exports: [TallyExportService],
})
export class TallyModule {}
