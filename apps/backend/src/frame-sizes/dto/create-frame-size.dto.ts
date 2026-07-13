import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFrameSizeDto {
  @ApiProperty({ example: '20x20' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 150000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean;
}

