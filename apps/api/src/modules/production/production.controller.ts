import { Controller, Get, Post, Body, Delete, Param, Req } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  createProductionEntry(@Body() entry: any, @Req() req: any) {
    const user = req?.user?.username || entry.createdBy || 'SYSTEM';
    return this.productionService.create({ ...entry, createdBy: user });
  }

  @Get()
  getProductionHistory() {
    return this.productionService.findAll();
  }

  @Delete(':id')
  deleteProduction(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Req() req?: any,
  ) {
    const user = req?.user?.username || 'SYSTEM';
    return this.productionService.delete(parseInt(id), user, reason);
  }
}
