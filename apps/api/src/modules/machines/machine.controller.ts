import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MachineService } from './machine.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get()
  listMachines() {
    return this.machineService.listMachines();
  }

  @Post()
  @Roles('MODIFIER')
  createMachine(@Body() body: {
    code: string;
    name: string;
    type: string;
    brand?: string;
    spindles?: number;
    status?: string;
    installDate?: string;
  }) {
    return this.machineService.createMachine(body);
  }

  @Get('inspections')
  listInspections(@Query('machineId') machineId?: string) {
    return this.machineService.listInspections(
      machineId ? parseInt(machineId, 10) : undefined,
    );
  }

  @Post('inspections')
  @Roles('MODIFIER')
  createInspection(@Body() body: {
    machineId: number;
    type: string;
    description?: string;
    technician?: string;
    nextDueAt?: string;
  }) {
    return this.machineService.createInspection(body);
  }
}
