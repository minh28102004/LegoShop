import type {
  CreateFrameBackgroundRequestContract,
  JsonValue,
  ProductStatus,
} from '@lego-shop/shared';
import { PRODUCT_STATUS } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseJsonValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

export class CreateFrameBackgroundDto implements CreateFrameBackgroundRequestContract {
  @ApiProperty({ example: 'Graduation Frame Background' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Mau tot nghiep voi ten, ngay va loi chuc.' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Dien ten nguoi nhan, ngay tot nghiep va loi chuc.' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ example: '/shared/images/bg_template/1.png' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    example: [
      {
        key: 'title',
        label: 'Ten nguoi nhan',
        type: 'text',
        required: true,
        placeholder: 'VD: Nguyen Phuc Thien Nhi',
      },
      {
        key: 'date',
        label: 'Ngay tot nghiep',
        type: 'date',
        required: false,
        placeholder: 'VD: 01/06/2026',
      },
    ],
  })
  @Transform(parseJsonValue)
  @IsOptional()
  contentFields?: JsonValue;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: PRODUCT_STATUS, example: PRODUCT_STATUS.ACTIVE })
  @IsOptional()
  @IsEnum(PRODUCT_STATUS)
  status?: ProductStatus;
}
