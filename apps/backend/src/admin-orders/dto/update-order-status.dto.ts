import type { OrderStatus, UpdateOrderStatusRequestContract } from '@lego-shop/shared';
import { ORDER_STATUS } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto implements UpdateOrderStatusRequestContract {
  @ApiProperty({
    enum: ORDER_STATUS,
    example: ORDER_STATUS.CONFIRMED,
  })
  @IsEnum(ORDER_STATUS)
  status: OrderStatus;
}
