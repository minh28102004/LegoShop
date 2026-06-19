import type { CreateOrderItemRequestContract, JsonObject } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOrderItemDto implements CreateOrderItemRequestContract {
  @ApiPropertyOptional({
    example: '8d33f2a5-f6da-4a07-a2f1-2359f5f818a7',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({
    example: 'Dragon Brick Set',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
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
  designData?: JsonObject;

  @ApiPropertyOptional({
    example: 'https://example.com/preview.jpg',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  previewUrl?: string;
}
