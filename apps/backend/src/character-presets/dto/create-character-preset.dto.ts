import type { CreateCharacterPresetRequestContract, ProductStatus } from '@lego-shop/shared';
import { PRODUCT_STATUS } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class CreateCharacterPresetDto implements CreateCharacterPresetRequestContract {
  @ApiProperty({ example: 'Nam tốt nghiệp' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Tóc nam + mũ tốt nghiệp' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'nam' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  faceHint?: string;

  @ApiPropertyOptional({ example: 'nam' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  hairHint?: string;

  @ApiPropertyOptional({ example: 'đỏ' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  torsoHint?: string;

  @ApiPropertyOptional({ example: 'đỏ' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  legsHint?: string;

  @ApiPropertyOptional({ example: 'tốt nghiệp' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  hatHint?: string;

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
