import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetAdminOrdersQueryDto {
  @ApiPropertyOptional({
    example: 'LS20260531',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'orderCode,customerName,email,phone',
  })
  @IsOptional()
  @IsString()
  search_fields?: string;

  @ApiPropertyOptional({ example: 'pending,confirmed' })
  @IsOptional()
  @IsString()
  orderStatus?: string;

  @ApiPropertyOptional({ example: 'unpaid,paid' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'pending,shipping' })
  @IsOptional()
  @IsString()
  shippingStatus?: string;

  @ApiPropertyOptional({ example: 'pending,confirmed' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'unpaid,paid' })
  @IsOptional()
  @IsString()
  payment_status?: string;

  @ApiPropertyOptional({ example: 'shipping,delivered' })
  @IsOptional()
  @IsString()
  shipping_status?: string;

  @ApiPropertyOptional({ example: 'COD,PAYOS' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ example: 'COD,PAYOS' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 500000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount_min?: number;

  @ApiPropertyOptional({ example: 5000000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount_max?: number;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({ example: 'desc,asc', default: 'desc' })
  @IsOptional()
  @IsString()
  sort_dir?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  date_field?: string;

  @ApiPropertyOptional({ example: 'today' })
  @IsOptional()
  @IsString()
  preset?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    maximum: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
