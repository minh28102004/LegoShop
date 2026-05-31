import { ShippingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateShippingStatusDto {
  @ApiProperty({
    enum: ShippingStatus,
    example: ShippingStatus.preparing,
  })
  @IsEnum(ShippingStatus)
  status: ShippingStatus;
}
