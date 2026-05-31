import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBusinessInquiryDto {
  @ApiProperty({
    example: 'ABC Brick Company',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    example: 'Nguyen Van B',
  })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({
    example: 'business@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '0911222333',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'Toi muon dat so luong lon cho su kien.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
