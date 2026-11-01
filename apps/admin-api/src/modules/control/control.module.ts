import { Module } from '@nestjs/common';
import { ControlController } from './control.controller';
import { ControlService } from './control.service';
import { EvidenceService } from './evidence.service';
import { OperationsController } from './operations.controller';
@Module({ controllers:[ControlController,OperationsController],providers:[ControlService,EvidenceService],exports:[ControlService,EvidenceService] })
export class ControlModule {}
