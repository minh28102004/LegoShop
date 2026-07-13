import type { PaymentStatus, UpdatePaymentStatusRequestContract } from '@lego-shop/shared';
import { PAYMENT_STATUS } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdatePaymentStatusDto implements UpdatePaymentStatusRequestContract {
  @ApiProperty({
    enum: PAYMENT_STATUS,
    example: PAYMENT_STATUS.PAID,
  })
  @IsEnum(PAYMENT_STATUS)
  status: PaymentStatus;
}
