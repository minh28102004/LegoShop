import { PartialType } from '@nestjs/swagger';
import { CreateCharacterPartDto } from './create-character-part.dto';

export class UpdateCharacterPartDto extends PartialType(CreateCharacterPartDto) {}
