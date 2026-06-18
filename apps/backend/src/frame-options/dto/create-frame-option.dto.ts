import { FrameOptionType, ProductStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class CreateFrameOptionDto {
  @ApiProperty({ enum: FrameOptionType, example: FrameOptionType.size })
  @IsOptional()
  @IsEnum(FrameOptionType)
  type?: FrameOptionType;

  @ApiPropertyOptional({ example: 'Khung 20x30 cm' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: '20 x 30 cm' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: 'size-20x30' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Kích thước phổ biến cho tranh để bàn.' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiPropertyOptional({ example: 'https://example.com/frame-preview.png' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 20 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  widthCm?: number;

  @ApiPropertyOptional({ example: 30 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @ApiPropertyOptional({ example: 150000, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 25, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional({ example: 99, default: 99 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxQuantity?: number;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({
    type: Object,
    example: { material: 'wood', finish: 'matte' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.active })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
