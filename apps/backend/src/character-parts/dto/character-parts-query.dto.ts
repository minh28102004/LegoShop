import type { CharacterPartType } from '@lego-shop/shared';
import { CHARACTER_PART_TYPE } from '@lego-shop/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AdminListQueryDto } from '../../common/dto/admin-list-query.dto';

export class CharacterPartsQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ example: 100, default: 100, maximum: 200 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  declare limit?: number;

  @ApiPropertyOptional({
    enum: CHARACTER_PART_TYPE,
    example: CHARACTER_PART_TYPE.FACE,
  })
  @IsOptional()
  @IsEnum(CHARACTER_PART_TYPE)
  type?: CharacterPartType;
}
