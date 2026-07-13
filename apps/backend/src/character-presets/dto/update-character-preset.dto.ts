import { PartialType } from '@nestjs/swagger';
import { CreateCharacterPresetDto } from './create-character-preset.dto';

export class UpdateCharacterPresetDto extends PartialType(CreateCharacterPresetDto) {}
