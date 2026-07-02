import type { CreateCharacterRequestContract, ProductStatus } from '@lego-shop/shared';
import { PRODUCT_STATUS } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class CreateCharacterDto implements CreateCharacterRequestContract {
  @ApiProperty({ example: 'Nhan vat ao xanh' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 10000, default: 10000 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: '/uploads/admin/character-blue.png' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: PRODUCT_STATUS, example: PRODUCT_STATUS.ACTIVE })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;
}
