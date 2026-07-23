import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartQuoteDto } from './dto/cart-quote.dto';
import { TrackOrderDto } from './dto/track-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Post('public/cart/quote')
  quoteCart(@Body() cartQuoteDto: CartQuoteDto) {
    return this.ordersService.quoteCart(cartQuoteDto);
  }

  @Get('public/checkout/settings')
  getCheckoutSettings() {
    return this.ordersService.getCheckoutSettings();
  }

  @Get('orders/track/:orderCode')
  trackOrder(@Param('orderCode') orderCode: string) {
    return this.ordersService.trackOrder(orderCode);
  }

  @Post('orders/track')
  trackOrderByPhone(@Body() trackOrderDto: TrackOrderDto) {
    return this.ordersService.trackOrderByPhone(
      trackOrderDto.orderCode,
      trackOrderDto.phone,
    );
  }

  @Post('orders/:orderCode/create-payment-link')
  createPaymentLink(@Param('orderCode') orderCode: string) {
    return this.ordersService.createPaymentLink(orderCode);
  }
}
