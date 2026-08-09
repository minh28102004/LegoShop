import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional({
    example: 'Figure Lab Admin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
