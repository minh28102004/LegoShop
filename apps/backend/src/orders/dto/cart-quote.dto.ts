import type {
  CartQuoteItemRequestContract,
  CartQuoteRequestContract,
  JsonObject,
} from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

const SHIPPING_METHODS = ['shop_support', 'self'] as const;
const POLAROID_OPTIONS = ['none', '2', '4'] as const;

export class CartQuoteItemDto implements CartQuoteItemRequestContract {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cartItemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ minimum: 1, maximum: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceSnapshot: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frameOptionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frameSizeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frameSizeLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frameColorName?: string;

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  accessories?: Array<{
    id: string;
    name?: string;
    price?: number;
    quantity?: number;
  }>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  designData?: JsonObject;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewUrl?: string;
}

export class CartQuoteDto implements CartQuoteRequestContract {
  @ApiProperty({ type: [CartQuoteItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartQuoteItemDto)
  items: CartQuoteItemDto[];

  @ApiPropertyOptional({ enum: SHIPPING_METHODS })
  @IsOptional()
  @IsIn(SHIPPING_METHODS)
  shippingMethod?: (typeof SHIPPING_METHODS)[number];

  @ApiPropertyOptional({ enum: [PaymentMethod.COD, PaymentMethod.PAYOS] })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  giftPackage?: boolean;

  @ApiPropertyOptional({ enum: POLAROID_OPTIONS })
  @IsOptional()
  @IsIn(POLAROID_OPTIONS)
  polaroidOption?: (typeof POLAROID_OPTIONS)[number];

  @ApiPropertyOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  voucherCode?: string;
}
