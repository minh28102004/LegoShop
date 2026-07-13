import { PartialType } from '@nestjs/swagger';
import { CreateFrameBackgroundDto } from './create-frame-background.dto';

export class UpdateFrameBackgroundDto extends PartialType(CreateFrameBackgroundDto) {}
