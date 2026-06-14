import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get('orders/track/:orderCode')
  trackOrder(@Param('orderCode') orderCode: string) {
    return this.ordersService.trackOrder(orderCode);
  }

  @Post('orders/:orderCode/create-payment-link')
  createPaymentLink(@Param('orderCode') orderCode: string) {
    return this.ordersService.createPaymentLink(orderCode);
  }
}
