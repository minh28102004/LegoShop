import type {
  CreateVoucherRequestContract,
  ProductStatus,
  VoucherDiscountType,
} from '@lego-shop/shared';
import { PRODUCT_STATUS, VOUCHER_DISCOUNT_TYPE } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const nullableNumber = ({ value }: { value: unknown }) => {
  if (value === '' || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
};

const uppercaseCode = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateVoucherDto implements CreateVoucherRequestContract {
  @ApiProperty({ example: 'SUMMER20' })
  @Transform(uppercaseCode)
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Giảm 20% cho khách hàng thân thiết' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: VOUCHER_DISCOUNT_TYPE,
    example: VOUCHER_DISCOUNT_TYPE.PERCENTAGE,
  })
  @IsEnum(VOUCHER_DISCOUNT_TYPE)
  discountType: VoucherDiscountType;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  discountValue: number;

  @ApiPropertyOptional({ example: 300000, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 50000, nullable: true })
  @Transform(nullableNumber)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number | null;

  @ApiPropertyOptional({ example: 100, nullable: true })
  @Transform(nullableNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number | null;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z', nullable: true })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional({ example: '2026-07-31T23:59:59.000Z', nullable: true })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional({ enum: PRODUCT_STATUS, example: PRODUCT_STATUS.ACTIVE })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;
}
