import { PartialType } from '@nestjs/swagger';
import { CreateFrameSizeDto } from './create-frame-size.dto';

export class UpdateFrameSizeDto extends PartialType(CreateFrameSizeDto) {}
