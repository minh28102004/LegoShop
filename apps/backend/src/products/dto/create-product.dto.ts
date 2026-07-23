import type {
  CreateProductRequestContract,
  ProductComponentConfig,
  ProductStatus,
  ProductType,
} from '@lego-shop/shared';
import { PRODUCT_STATUS, PRODUCT_TYPE } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseJsonObject = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
};

export class CreateProductDto implements CreateProductRequestContract {
  @ApiProperty({
    example: 'Dragon Brick Set',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'dragon-brick-set',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Brick set with dragon theme.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 299000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({
    type: [String],
    example: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    enum: PRODUCT_TYPE,
    example: PRODUCT_TYPE.FINISHED,
  })
  @IsOptional()
  @IsEnum(PRODUCT_TYPE)
  productType?: ProductType;

  @ApiPropertyOptional({
    type: Object,
    example: {
      frame: { id: 'frame-option-id', name: 'Khung 30x30 den', price: 30000 },
      frameColor: {
        id: 'frame-color-id',
        name: 'Den',
        price: 0,
      },
      background: { id: 'background-id', name: 'Nen trai tim', price: 0 },
      characters: [
        {
          id: 'character-id',
          name: 'Nhan vat',
          quantity: 2,
          price: 10000,
        },
      ],
      accessories: [
        {
          id: 'accessory-id',
          name: 'Charm trai tim',
          quantity: 1,
          price: 10000,
        },
      ],
      includedItems: [
        { id: 'gift-box', name: 'Hop qua', quantity: 1, icon: 'gift' },
      ],
      originalPrice: 350000,
    },
  })
  @Transform(parseJsonObject)
  @IsOptional()
  @IsObject()
  componentConfig?: ProductComponentConfig;

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
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  collectionId?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
