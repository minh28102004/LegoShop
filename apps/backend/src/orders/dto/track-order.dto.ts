import type { TrackOrderRequestContract } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrackOrderDto implements TrackOrderRequestContract {
  @ApiProperty({ example: 'LS20260627012345' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  orderCode: string;

  @ApiProperty({ example: '0909123456' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  phone: string;
}
