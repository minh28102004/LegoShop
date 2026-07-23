import type { BusinessQuoteRequestContract } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class BusinessQuoteDto implements BusinessQuoteRequestContract {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  frameId: string;

  @ApiProperty({ minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  characterCount: number;

  @ApiProperty({ minimum: 0, maximum: 5 })
  @IsInt()
  @Min(0)
  @Max(5)
  charmCount: number;

  @ApiProperty({ minimum: 10, maximum: 5000 })
  @IsInt()
  @Min(10)
  @Max(5000)
  quantity: number;

  @ApiProperty()
  @IsBoolean()
  brandDesign: boolean;

  @ApiProperty()
  @IsBoolean()
  logoPlacement: boolean;

  @ApiProperty()
  @IsBoolean()
  premiumPackaging: boolean;

  @ApiProperty()
  @IsBoolean()
  documents: boolean;
}
