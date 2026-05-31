import { OrderStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.confirmed,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
