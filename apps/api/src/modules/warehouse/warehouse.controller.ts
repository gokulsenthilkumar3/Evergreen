import { CreateLocationDto, CreateMovementDto } from './warehouse.dto';
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
  createLocation(@Body() body: CreateLocationDto) {
    return this.warehouseService.createLocation(body);
  }

  @Get('movements')
  listMovements(
    @Query('locationId', new ParseIntPipe({ optional: true }))
    locationId?: number,
  ) {
    return this.warehouseService.listMovements(locationId);
  }

  @Post('movements')
  @Roles('MODIFIER')
  createMovement(@Body() body: CreateMovementDto) {
    return this.warehouseService.createMovement(body);
  }
}
