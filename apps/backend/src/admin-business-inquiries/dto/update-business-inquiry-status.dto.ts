import type { UpdateBusinessInquiryStatusRequestContract } from '@lego-shop/shared';
import { INQUIRY_STATUS, INQUIRY_STATUS_VALUES } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateBusinessInquiryStatusDto implements UpdateBusinessInquiryStatusRequestContract {
  @ApiProperty({
    enum: INQUIRY_STATUS,
    example: INQUIRY_STATUS.CONTACTED,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(INQUIRY_STATUS_VALUES)
  status: UpdateBusinessInquiryStatusRequestContract['status'];
}
