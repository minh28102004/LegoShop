import type { CreateBusinessInquiryRequestContract } from '@lego-shop/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateBusinessInquiryDto implements CreateBusinessInquiryRequestContract {
  @ApiProperty({
    example: 'ABC Brick Company',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional({
    example: 'Nguyen Van B',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((dto: CreateBusinessInquiryDto) => !dto.contactPerson)
  @IsString()
  @IsNotEmpty()
  contactName?: string;

  @ApiPropertyOptional({
    example: 'Nguyen Van B',
    description: 'Alias for contactName.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((dto: CreateBusinessInquiryDto) => !dto.contactName)
  @IsString()
  @IsNotEmpty()
  contactPerson?: string;

  @ApiProperty({
    example: 'business@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '0911222333',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'Toi muon dat so luong lon cho su kien.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  message: string;
}
