import { Module } from '@nestjs/common';
import { CicdController } from './cicd.controller';
import { CicdService } from './cicd.service';
import { DatabaseModule } from '../database/database.module';
import { ControlModule } from '../control/control.module';

@Module({
  imports: [DatabaseModule,ControlModule],
  controllers: [CicdController],
  providers: [CicdService],
  exports: [CicdService],
})
export class CicdModule {}
