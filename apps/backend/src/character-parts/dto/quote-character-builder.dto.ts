import type { CharacterBuilderQuoteRequestContract } from '@lego-shop/shared';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class QuoteCharacterBuilderDto implements CharacterBuilderQuoteRequestContract {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(24)
  @IsUUID('4', { each: true })
  partIds: string[];
}
