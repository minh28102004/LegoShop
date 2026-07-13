import type {
  CharacterPartType,
  CreateCharacterPartRequestContract,
  JsonValue,
  ProductStatus,
} from '@lego-shop/shared';
import { CHARACTER_PART_TYPE, PRODUCT_STATUS } from '@lego-shop/shared';
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

const parseJsonValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

export class CreateCharacterPartDto implements CreateCharacterPartRequestContract {
  @ApiProperty({ example: 'Smile face 01' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CHARACTER_PART_TYPE, example: CHARACTER_PART_TYPE.FACE })
  @IsEnum(CHARACTER_PART_TYPE)
  type: CharacterPartType;

  @ApiProperty({ example: '/uploads/admin/face-smile-01.png' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  priceAdjustment?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: ['black', 'short'] })
  @Transform(parseJsonValue)
  @IsOptional()
  tags?: JsonValue;

  @ApiPropertyOptional({ enum: PRODUCT_STATUS, example: PRODUCT_STATUS.ACTIVE })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;
}
