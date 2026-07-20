import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const SORT_VALUES = [
  'featured',
  'newest',
  'popular',
  'price_asc',
  'price_desc',
  'name_asc',
] as const;

const STATUS_VALUES = ['active', 'inactive', 'draft'] as const;

function toOptionalBoolean({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return value;
}

function toStringArray({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const values = Array.isArray(value) ? value : String(value).split(',');
  const normalized = values
    .map((item) => String(item).trim())
    .filter(Boolean);
  return normalized.length ? Array.from(new Set(normalized)) : undefined;
}

function toNumberArray({ value }: { value: unknown }): number[] | undefined {
  const values = toStringArray({ value });
  if (!values?.length) return undefined;
  const normalized = values
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item >= 0)
    .map((item) => Math.trunc(item));
  return normalized.length ? Array.from(new Set(normalized)) : undefined;
}

export class PublicProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  pageSize?: number;

  // Kept for older web callers that still request a larger unpaginated list.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  collection?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  collections?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  collectionIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  characterCount?: number;

  @IsOptional()
  @Transform(toNumberArray)
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  characterCounts?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  charmCount?: number;

  @IsOptional()
  @Transform(toNumberArray)
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  charmCounts?: number[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsIn(STATUS_VALUES, { each: true })
  statuses?: (typeof STATUS_VALUES)[number][];

  @IsOptional()
  @IsIn(SORT_VALUES)
  sort?: (typeof SORT_VALUES)[number];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  includedGift?: boolean;

  @IsOptional()
  @IsString()
  frameSize?: string;
}
