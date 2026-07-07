import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CharacterPresetsController } from './character-presets.controller';
import { CharacterPresetsService } from './character-presets.service';

@Module({
  imports: [PrismaModule],
  controllers: [CharacterPresetsController],
  providers: [CharacterPresetsService],
})
export class CharacterPresetsModule {}
