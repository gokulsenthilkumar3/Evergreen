import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('locations')
  listLocations() {
    return this.warehouseService.listLocations();
  }

  @Post('locations')
  @Roles('MODIFIER')
  createLocation(@Body() body: {
    name: string;
    zone?: string;
    description?: string;
    createdBy?: string;
  }) {
    return this.warehouseService.createLocation(body);
  }

  @Get('movements')
  listMovements(@Query('locationId') locationId?: string) {
    return this.warehouseService.listMovements(
      locationId ? parseInt(locationId, 10) : undefined,
    );
  }

  @Post('movements')
  @Roles('MODIFIER')
  createMovement(@Body() body: {
    locationId: number;
    itemId: number;
    quantity: number;
    movementType: string;
    referenceId?: string;
    notes?: string;
    createdBy?: string;
  }) {
    return this.warehouseService.createMovement(body);
  }
}
