import { PartialType } from '@nestjs/swagger';
import { CreateFrameColorDto } from './create-frame-color.dto';

export class UpdateFrameColorDto extends PartialType(CreateFrameColorDto) {}
