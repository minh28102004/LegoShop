import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePaymentSettingsDto {
  @ApiPropertyOptional({
    example: true,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  codEnabled?: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  payosEnabled?: boolean;

  @ApiPropertyOptional({
    example: false,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  codDepositEnabled?: boolean;

  @ApiPropertyOptional({
    example: 30,
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  codDepositPercent?: number;
}
