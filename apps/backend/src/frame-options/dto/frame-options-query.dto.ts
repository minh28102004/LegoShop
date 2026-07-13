import type { FrameOptionType } from '@lego-shop/shared';
import { FRAME_OPTION_TYPE } from '@lego-shop/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AdminListQueryDto } from '../../common/dto/admin-list-query.dto';

export class FrameOptionsQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ enum: FRAME_OPTION_TYPE })
  @IsOptional()
  @IsEnum(FRAME_OPTION_TYPE)
  type?: FrameOptionType;
}
