import { FrameOptionType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AdminListQueryDto } from '../../common/dto/admin-list-query.dto';

export class FrameOptionsQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ enum: FrameOptionType })
  @IsOptional()
  @IsEnum(FrameOptionType)
  type?: FrameOptionType;
}
