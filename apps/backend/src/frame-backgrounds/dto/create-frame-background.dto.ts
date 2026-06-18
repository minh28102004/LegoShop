import { ProductStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateFrameBackgroundDto {
  @ApiProperty({ example: 'Graduation Frame Background' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '/shared/images/bg_template/1.png' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.active })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
