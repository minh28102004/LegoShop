import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional({
    example: 'Lego Shop Admin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
