import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminOrdersService } from './admin-orders.service';
import { GetAdminOrdersQueryDto } from './dto/get-admin-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get('admin/orders')
  findAdminOrders(@Query() query: GetAdminOrdersQueryDto) {
    return this.adminOrdersService.findAdminOrders(query);
  }

  @Get('admin/orders/:id')
  findAdminOrderById(@Param('id') id: string) {
    return this.adminOrdersService.findAdminOrderById(id);
  }

  @Patch('admin/orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminOrdersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Patch('admin/orders/:id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.adminOrdersService.updatePaymentStatus(id, updatePaymentStatusDto);
  }

  @Patch('admin/orders/:id/shipping-status')
  updateShippingStatus(
    @Param('id') id: string,
    @Body() updateShippingStatusDto: UpdateShippingStatusDto,
  ) {
    return this.adminOrdersService.updateShippingStatus(id, updateShippingStatusDto);
  }
}
