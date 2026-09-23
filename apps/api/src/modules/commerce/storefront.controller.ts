import { Body, Controller, Get, Post } from '@nestjs/common';
import { StorefrontService } from './storefront.service';

@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}
  @Get('products') products() { return this.storefront.products(); }
  @Post('orders') order(@Body() body: any) { return this.storefront.placeOrder(body); }
}
