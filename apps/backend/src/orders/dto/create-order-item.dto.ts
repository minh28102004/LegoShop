import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiPropertyOptional({
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  productId?: string | null;

  @ApiProperty({
    example: 'Dragon Brick Set',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 299000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    type: Object,
    example: {
      note: 'demo design',
    },
  })
  @IsOptional()
  @IsObject()
  designData?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'https://example.com/preview.jpg',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  previewUrl?: string;
}
