import type {
  CreateFeedbackRequestContract,
  ProductStatus,
} from '@lego-shop/shared';
import { PRODUCT_STATUS } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const trimText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateFeedbackDto implements CreateFeedbackRequestContract {
  @ApiProperty({ example: 'Ngọc Mai' })
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'Khung đôi tốt nghiệp' })
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  productType: string;

  @ApiProperty({ example: 'Thành phẩm đẹp và giống mẫu đã duyệt.' })
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  quote: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: PRODUCT_STATUS })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;
}
