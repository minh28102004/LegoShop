import {
  normalizeVietnamesePhone,
  type TrackOrderRequestContract,
} from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrackOrderDto implements TrackOrderRequestContract {
  @ApiProperty({
    example: '0909123456',
    description:
      'Vietnamese phone number used at checkout. +84 is normalized to 0.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeVietnamesePhone(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  phone: string;
}
