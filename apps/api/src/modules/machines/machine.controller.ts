import {
  CreateMachineDto,
  CreateMachineInspectionDto,
  MachineInspectionAtPathDto,
} from './machine.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
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
  createMachine(@Body() body: CreateMachineDto) {
    return this.machineService.createMachine(body);
  }

  @Get('inspections')
  listInspections(
    @Query('machineId', new ParseIntPipe({ optional: true }))
    machineId?: number,
  ) {
    return this.machineService.listInspections(machineId);
  }

  @Post('inspections')
  @Roles('MODIFIER')
  createInspection(@Body() body: CreateMachineInspectionDto) {
    return this.machineService.createInspection(body);
  }

  @Get(':id/inspections')
  listMachineInspections(@Param('id', ParseIntPipe) id: number) {
    return this.machineService.listInspections(id);
  }

  @Post(':id/inspections')
  @Roles('MODIFIER')
  createMachineInspection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MachineInspectionAtPathDto,
  ) {
    return this.machineService.createInspection({ ...body, machineId: id });
  }
}
