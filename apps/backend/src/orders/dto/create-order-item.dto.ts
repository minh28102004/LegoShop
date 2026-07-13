import type { CreateOrderItemRequestContract, JsonObject } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsArray,
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
    example: '8d33f2a5-f6da-4a07-a2f1-2359f5f818a7',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  frameOptionId?: string;

  @ApiPropertyOptional({
    example: 'a4db80f6-0795-43c1-b543-ec0be249bfe0',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  backgroundId?: string;

  @ApiPropertyOptional({
    example: '23x23cm',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  frameSizeId?: string;

  @ApiPropertyOptional({
    example: '23x23cm',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  frameSizeLabel?: string;

  @ApiPropertyOptional({
    example: 'White',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  frameColorName?: string;

  @ApiPropertyOptional({
    example: 'In tên Minh Anh, đổi lời chúc theo ghi chú này',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    type: Array,
    example: [{ id: 'acc-1', name: 'Cup', price: 10000, quantity: 1 }],
  })
  @IsOptional()
  @IsArray()
  accessories?: Array<{ id: string; name: string; price: number; quantity?: number }>;

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
