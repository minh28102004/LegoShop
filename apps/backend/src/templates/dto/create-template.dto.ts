import type { CreateTemplateRequestContract, JsonObject, ProductStatus } from '@lego-shop/shared';
import { PRODUCT_STATUS } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTemplateDto implements CreateTemplateRequestContract {
  @ApiProperty({
    example: 'Castle Display Template',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/template.jpg',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      canvasWidth: 800,
      canvasHeight: 800,
    },
  })
  @IsOptional()
  @IsObject()
  configJson?: JsonObject;

  @ApiPropertyOptional({
    enum: PRODUCT_STATUS,
    example: PRODUCT_STATUS.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: 'f0f4a4bb-7fc3-4fe9-b99e-12f17f1f7f57',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;
}
