import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
    constructor(private readonly productionService: ProductionService) { }

    @Post()
    createProductionEntry(@Body() entry: any) {
        return this.productionService.create(entry);
    }

    @Get()
    getProductionHistory() {
        return this.productionService.findAll();
    }

    @Delete(':id')
    deleteProduction(@Param('id') id: string) {
        return this.productionService.delete(parseInt(id));
    }
}
