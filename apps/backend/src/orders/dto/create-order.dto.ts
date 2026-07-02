import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

const SHIPPING_METHODS = ['shop_support', 'self', 'standard', 'fast'] as const;
const POLAROID_OPTIONS = ['none', '2', '4'] as const;

export class CreateOrderDto {
  @ApiProperty({
    example: 'Nguyen Van A',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: '0909123456',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    example: '0909123456',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerPhone?: string;

  @ApiPropertyOptional({
    example: 'a@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'a@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({
    example: '0909123456',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  customerZalo?: string;

  @ApiProperty({
    example: '123 Nguyen Trai, HCM',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    example: '123 Nguyen Trai',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressLine?: string;

  @ApiPropertyOptional({
    example: 'Ha Noi',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    example: 'Ha Noi',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Dong Anh',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({
    example: 'Thu Lom',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({
    example: '2026-06-10',
  })
  @IsOptional()
  @IsDateString()
  receiveDate?: string;

  @ApiPropertyOptional({
    example: 'Call before delivery',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 'SUMMER20',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiPropertyOptional({
    enum: SHIPPING_METHODS,
    example: 'shop_support',
  })
  @IsOptional()
  @IsIn(SHIPPING_METHODS)
  shippingMethod?: (typeof SHIPPING_METHODS)[number];

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  giftPackage?: boolean;

  @ApiPropertyOptional({
    enum: POLAROID_OPTIONS,
    example: 'none',
  })
  @IsOptional()
  @IsIn(POLAROID_OPTIONS)
  polaroidOption?: (typeof POLAROID_OPTIONS)[number];

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
