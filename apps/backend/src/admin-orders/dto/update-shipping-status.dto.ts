import type { ShippingStatus, UpdateShippingStatusRequestContract } from '@lego-shop/shared';
import { SHIPPING_STATUS } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateShippingStatusDto implements UpdateShippingStatusRequestContract {
  @ApiProperty({
    enum: SHIPPING_STATUS,
    example: SHIPPING_STATUS.PREPARING,
  })
  @IsEnum(SHIPPING_STATUS)
  status: ShippingStatus;
}
