import type { CharacterPartType } from '@lego-shop/shared';
import { CHARACTER_PART_TYPE } from '@lego-shop/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AdminListQueryDto } from '../../common/dto/admin-list-query.dto';

export class CharacterPartsQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ enum: CHARACTER_PART_TYPE, example: CHARACTER_PART_TYPE.FACE })
  @IsOptional()
  @IsEnum(CHARACTER_PART_TYPE)
  type?: CharacterPartType;
}
