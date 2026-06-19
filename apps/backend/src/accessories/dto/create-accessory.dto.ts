import type { CreateAccessoryRequestContract, ProductStatus } from '@lego-shop/shared';
import { PRODUCT_STATUS } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAccessoryDto implements CreateAccessoryRequestContract {
  @ApiProperty({
    example: 'Dragon Sword',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/sword.png',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/sword-icon.png',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  iconUrl?: string;

  @ApiPropertyOptional({
    enum: PRODUCT_STATUS,
    example: PRODUCT_STATUS.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: 'a4f8236c-f03e-4f58-b48f-89b6c8d7d1f0',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;
}
