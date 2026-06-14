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

export class AdminListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'lego' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'name,slug' })
  @IsOptional()
  @IsString()
  search_fields?: string;

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

  @ApiPropertyOptional({
    enum: [
      'today',
      'yesterday',
      'this_week',
      'last_week',
      'this_month',
      'last_month',
      'last_7_days',
      'last_30_days',
      'last_90_days',
    ],
  })
  @IsOptional()
  @IsString()
  preset?: string;

  @ApiPropertyOptional({ example: 'active,inactive' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ example: 100000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_min?: number;

  @ApiPropertyOptional({ example: 1000000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_max?: number;
}
