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

const SHIPPING_METHODS = ['standard', 'fast', 'self'] as const;
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
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    example: 'a@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '123 Nguyen Trai, HCM',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  address: string;

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
    enum: SHIPPING_METHODS,
    example: 'standard',
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
