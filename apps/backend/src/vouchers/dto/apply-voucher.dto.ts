import type { ApplyVoucherRequestContract } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ApplyVoucherDto implements ApplyVoucherRequestContract {
  @ApiProperty({ example: 'SUMMER20' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 450000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderAmount: number;
}
