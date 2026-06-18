import { PartialType } from '@nestjs/swagger';
import { CreateFrameOptionDto } from './create-frame-option.dto';

export class UpdateFrameOptionDto extends PartialType(CreateFrameOptionDto) {}
