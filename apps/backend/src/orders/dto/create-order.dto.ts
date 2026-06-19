import type { CreateOrderRequestContract, PaymentMethod } from '@lego-shop/shared';
import { PAYMENT_METHOD } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto implements CreateOrderRequestContract {
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
    example: '2026-06-10',
  })
  @IsOptional()
  @IsDateString()
  receiveDate?: string;

  @ApiProperty({
    enum: PAYMENT_METHOD,
    example: PAYMENT_METHOD.COD,
  })
  @IsEnum(PAYMENT_METHOD)
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
