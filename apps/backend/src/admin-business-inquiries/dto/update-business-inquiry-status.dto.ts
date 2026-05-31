import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const ALLOWED_INQUIRY_STATUSES = [
  'new',
  'contacted',
  'processing',
  'done',
  'cancelled',
] as const;

export class UpdateBusinessInquiryStatusDto {
  @ApiProperty({
    enum: ALLOWED_INQUIRY_STATUSES,
    example: 'contacted',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_INQUIRY_STATUSES)
  status: (typeof ALLOWED_INQUIRY_STATUSES)[number];
}
