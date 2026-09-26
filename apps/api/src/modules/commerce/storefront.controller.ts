import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StorefrontService } from './storefront.service';
import { Public } from '../../decorators/public.decorator';
import { PublicOrderRateLimitGuard } from '../../guards/public-order-rate-limit.guard';

@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}
  @Public()
  @Get('products') products() { return this.storefront.products(); }
  @Public()
  @UseGuards(PublicOrderRateLimitGuard)
  @Post('orders') order(@Body() body: any) { return this.storefront.placeOrder(body); }
}
