import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CharacterPartsController } from './character-parts.controller';
import { CharacterPartsService } from './character-parts.service';

@Module({
  imports: [PrismaModule],
  controllers: [CharacterPartsController],
  providers: [CharacterPartsService],
})
export class CharacterPartsModule {}
